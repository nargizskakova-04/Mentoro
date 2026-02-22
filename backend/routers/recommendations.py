from collections import defaultdict
from typing import List, Dict

from fastapi import APIRouter, Depends, Request
from fastapi.responses import JSONResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models import User, QuizHistory
from schemas import verify_access_token

router = APIRouter()

def _extract_token(request: Request):
    token = request.cookies.get("auth_token")
    if token:
        return token
    auth = request.headers.get("Authorization", "")
    if auth.lower().startswith("bearer "):
        return auth[7:].strip()
    return None


def calculate_trend(scores: List[int]) -> str:
    if len(scores) < 2:
        return "stable"
    if scores[-1] > scores[0]:
        return "improving"
    elif scores[-1] < scores[0]:
        return "declining"
    return "stable"


def get_study_plan(study_goal: str, weak_topics: List[str], trend_map: Dict[str, str]) -> str:
    if not weak_topics:
        if study_goal == "exam":
            return "You are performing well. Continue full exam simulations and timed quizzes."
        return "Maintain your current learning pace and explore advanced topics."

    declining_topics = [t for t in weak_topics if trend_map.get(t) == "declining"]

    if study_goal == "exam":
        if declining_topics:
            return (
                f"Urgent focus on declining subjects: {', '.join(declining_topics)}. "
                f"Do daily quizzes and revision sessions."
            )
        return (
            f"Focus on intensive exam preparation for: {', '.join(weak_topics)}. "
            f"Practice quizzes daily and review mistakes."
        )

    if study_goal == "revision":
        return (
            f"Revise weak subjects: {', '.join(weak_topics)} with notes, summaries, "
            f"and explanation-based learning."
        )

    return (
        f"Study weak topics step by step: {', '.join(weak_topics)} "
        f"using quizzes and concept explanations."
    )


@router.get("/study-plan")
async def get_recommendations(request: Request, db: AsyncSession = Depends(get_db)):
    token = _extract_token(request)
    if not token:
        return JSONResponse(
            status_code=401,
            content={"message": "Not authenticated"},
        )

    decoded = verify_access_token(token)
    if not decoded or "userId" not in decoded:
        return JSONResponse(
            status_code=401,
            content={"message": "Invalid token"},
        )

    user_id = decoded["userId"]

    user = await db.get(User, user_id)
    if not user:
        return JSONResponse(
            status_code=404,
            content={"message": "User not found"},
        )

    result = await db.execute(
        select(QuizHistory)
        .where(QuizHistory.user_id == user.id)
        .order_by(QuizHistory.created_at.asc())
    )
    history = result.scalars().all()

    if not history:
        return JSONResponse(
            status_code=200,
            content={
                "message": "No quiz history yet",
                "recommended_action": "Start with a diagnostic quiz to detect weak areas",
                "study_goal": user.study_goal,
                "weak_topics": [],
                "strong_topics": [],
                "study_plan": "Take 1-2 quizzes to build your personalized learning profile",
                "study_hours_per_week": user.study_hours_per_week,
            },
        )

    topic_scores: Dict[str, List[int]] = defaultdict(list)

    for record in history:
        topic_scores[record.topic].append(record.percentage)

    avg_scores = {
        topic: round(sum(scores) / len(scores), 2)
        for topic, scores in topic_scores.items()
    }

    trend_map = {
        topic: calculate_trend(scores)
        for topic, scores in topic_scores.items()
    }

    weak_topics = [
        topic for topic, avg in avg_scores.items() if avg < 70
    ]

    strong_topics = [
        topic for topic, avg in avg_scores.items() if avg >= 85
    ]

    recommended_hours = user.study_hours_per_week
    if weak_topics:
        recommended_hours += 2
    if len(weak_topics) >= 3:
        recommended_hours += 2

    study_plan = get_study_plan(user.study_goal, weak_topics, trend_map)

    return JSONResponse(
        status_code=200,
        content={
            "study_goal": user.study_goal,
            "weak_topics": weak_topics,
            "strong_topics": strong_topics,
            "average_scores": avg_scores,
            "trend_analysis": trend_map,
            "recommended_action": (
                f"Prioritize weak subjects: {', '.join(weak_topics)}"
                if weak_topics
                else "Excellent performance. Move to advanced topics."
            ),
            "study_plan": study_plan,
            "recommended_study_hours_per_week": recommended_hours,
        },
    )