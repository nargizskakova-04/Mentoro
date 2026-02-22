from fastapi import APIRouter, Depends, Request
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database import get_db
from models import QuizHistory
from schemas import QuizHistoryCreate, verify_access_token

router = APIRouter()

def _extract_token(request: Request):
    token = request.cookies.get("auth_token")
    if token:
        return token
    auth = request.headers.get("Authorization", "")
    if auth.lower().startswith("bearer "):
        return auth[7:].strip()
    return None

@router.post("/quiz")
async def save_quiz_result(
    payload: QuizHistoryCreate,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    token = _extract_token(request)
    if not token:
        return JSONResponse(status_code=401, content={"message": "Not authenticated"})

    decoded = verify_access_token(token)
    if not decoded or "userId" not in decoded:
        return JSONResponse(status_code=401, content={"message": "Invalid token"})

    user_id = decoded["userId"]

    if payload.total_questions <= 0:
        return JSONResponse(
            status_code=400,
            content={"message": "total_questions must be greater than 0"},
        )

    percentage = int((payload.score / payload.total_questions) * 100)

    history = QuizHistory(
        user_id=user_id,
        topic=payload.topic,
        score=payload.score,
        total_questions=payload.total_questions,
        percentage=percentage,
    )

    db.add(history)
    await db.commit()
    await db.refresh(history)

    return {
        "message": "Quiz result saved successfully",
        "percentage": percentage,
    }


@router.get("/quiz")
async def get_quiz_history(
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    token = _extract_token(request)
    if not token:
        return JSONResponse(status_code=401, content={"message": "Not authenticated"})

    decoded = verify_access_token(token)
    if not decoded or "userId" not in decoded:
        return JSONResponse(status_code=401, content={"message": "Invalid token"})

    user_id = decoded["userId"]

    result = await db.execute(
        select(QuizHistory).where(QuizHistory.user_id == user_id)
    )
    history = result.scalars().all()

    return {"history": history}