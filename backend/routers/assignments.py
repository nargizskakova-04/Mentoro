from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Request
from fastapi.responses import JSONResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models import Assignment
from schemas import (
    AssignmentCreate,
    AssignmentRead,
    AssignmentUpdate,
    verify_access_token,
)

router = APIRouter()


def _get_token_from_request(request: Request) -> Optional[str]:
    """Get auth token from cookie (browser) or Authorization Bearer (e.g. Postman)."""
    token = request.cookies.get("auth_token")
    if token:
        return token
    auth = request.headers.get("Authorization")
    if auth and auth.lower().startswith("bearer "):
        return auth[7:].strip()
    return None


async def get_current_user_id(request: Request) -> UUID:
    """Get current user id from auth cookie or Bearer token or raise 401."""
    token = _get_token_from_request(request)
    if not token:
        raise ValueError("Not authenticated")
    decoded = verify_access_token(token)
    if not decoded or "userId" not in decoded:
        raise ValueError("Invalid token")
    return UUID(decoded["userId"])


@router.get("")
async def list_assignments(
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    try:
        user_id = await get_current_user_id(request)
    except ValueError as e:
        return JSONResponse(
            status_code=401,
            content={"message": str(e)},
        )
    result = await db.execute(
        select(Assignment).where(Assignment.user_id == user_id).order_by(Assignment.created_at.desc())
    )
    assignments = result.scalars().all()
    return JSONResponse(
        status_code=200,
        content={
            "assignments": [
                AssignmentRead(
                    id=a.id,
                    user_id=a.user_id,
                    title=a.title,
                    course=a.course,
                    status=a.status,
                    score=a.score or "-",
                    createdAt=a.created_at,
                ).model_dump(mode="json")
                for a in assignments
            ]
        },
    )


@router.post("")
async def create_assignment(
    request: Request,
    payload: AssignmentCreate,
    db: AsyncSession = Depends(get_db),
):
    try:
        user_id = await get_current_user_id(request)
    except ValueError as e:
        return JSONResponse(status_code=401, content={"message": str(e)})

    assignment = Assignment(
        user_id=user_id,
        title=payload.title,
        course=payload.course,
        status=payload.status or "Pending",
        score=payload.score or "-",
    )
    db.add(assignment)
    await db.commit()
    await db.refresh(assignment)
    out = AssignmentRead(
        id=assignment.id,
        user_id=assignment.user_id,
        title=assignment.title,
        course=assignment.course,
        status=assignment.status,
        score=assignment.score or "-",
        createdAt=assignment.created_at,
    )
    return JSONResponse(
        status_code=201,
        content={"assignment": out.model_dump(mode="json"), "message": "Assignment created"},
    )


@router.get("/{assignment_id}")
async def get_assignment(
    request: Request,
    assignment_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    try:
        user_id = await get_current_user_id(request)
    except ValueError as e:
        return JSONResponse(status_code=401, content={"message": str(e)})

    assignment = await db.get(Assignment, assignment_id)
    if not assignment or assignment.user_id != user_id:
        return JSONResponse(status_code=404, content={"message": "Assignment not found"})
    out = AssignmentRead(
        id=assignment.id,
        user_id=assignment.user_id,
        title=assignment.title,
        course=assignment.course,
        status=assignment.status,
        score=assignment.score or "-",
        createdAt=assignment.created_at,
    )
    return JSONResponse(status_code=200, content={"assignment": out.model_dump(mode="json")})


@router.put("/{assignment_id}")
async def update_assignment(
    request: Request,
    assignment_id: UUID,
    payload: AssignmentUpdate,
    db: AsyncSession = Depends(get_db),
):
    try:
        user_id = await get_current_user_id(request)
    except ValueError as e:
        return JSONResponse(status_code=401, content={"message": str(e)})

    assignment = await db.get(Assignment, assignment_id)
    if not assignment or assignment.user_id != user_id:
        return JSONResponse(status_code=404, content={"message": "Assignment not found"})
    if payload.title is not None:
        assignment.title = payload.title
    if payload.course is not None:
        assignment.course = payload.course
    if payload.status is not None:
        assignment.status = payload.status
    if payload.score is not None:
        assignment.score = payload.score
    await db.commit()
    await db.refresh(assignment)
    out = AssignmentRead(
        id=assignment.id,
        user_id=assignment.user_id,
        title=assignment.title,
        course=assignment.course,
        status=assignment.status,
        score=assignment.score or "-",
        createdAt=assignment.created_at,
    )
    return JSONResponse(
        status_code=200,
        content={"assignment": out.model_dump(mode="json"), "message": "Assignment updated"},
    )


@router.delete("/{assignment_id}")
async def delete_assignment(
    request: Request,
    assignment_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    try:
        user_id = await get_current_user_id(request)
    except ValueError as e:
        return JSONResponse(status_code=401, content={"message": str(e)})

    assignment = await db.get(Assignment, assignment_id)
    if not assignment or assignment.user_id != user_id:
        return JSONResponse(status_code=404, content={"message": "Assignment not found"})
    await db.delete(assignment)
    await db.commit()
    return JSONResponse(status_code=200, content={"message": "Assignment deleted"})
