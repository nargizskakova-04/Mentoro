from datetime import timedelta
from typing import Optional

import bcrypt
from fastapi import APIRouter, Depends, Request
from fastapi.responses import JSONResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models import User
from schemas import (
    UserCreate,
    UserLogin,
    UserRead,
    UserUpdate,
    create_access_token,
    verify_access_token,
)

router = APIRouter()


def _extract_token(request: Request) -> Optional[str]:
    """Get auth token from cookie (browser) or Authorization Bearer header (Postman/API)."""
    token = request.cookies.get("auth_token")
    if token:
        return token
    auth = request.headers.get("Authorization", "")
    if auth.lower().startswith("bearer "):
        return auth[7:].strip()
    return None


def _user_to_read(user: User) -> UserRead:
    return UserRead(
        id=user.id,
        name=user.name,
        email=user.email,
        major=user.major,
        group=user.group,
        gpa=user.gpa,
        study_goal=user.study_goal,
        weak_subjects=user.weak_subjects,
        study_hours_per_week=user.study_hours_per_week,
        createdAt=user.created_at,
    )


@router.post("/register")
async def register_user(payload: UserCreate, db: AsyncSession = Depends(get_db)):
    
    existing = await db.scalar(select(User).where(User.email == payload.email))
    if existing:
        return JSONResponse(
            status_code=409,
            content={"message": "User already exists"},
        )

    
    password_hash = bcrypt.hashpw(
        payload.password.encode("utf-8"),
        bcrypt.gensalt()
    ).decode("utf-8")

    
    user = User(
        name=payload.name,
        email=payload.email,
        password_hash=password_hash,
        
    )

    db.add(user)
    await db.commit()
    await db.refresh(user)

    
    user_out = UserRead(
        id=user.id,
        name=user.name,
        email=user.email,
        major=user.major,
        group=user.group,
        gpa=user.gpa,
        study_goal=user.study_goal,
        weak_subjects=user.weak_subjects,
        study_hours_per_week=user.study_hours_per_week,
        createdAt=user.created_at,
    )

    return JSONResponse(
        status_code=201,
        content={
            "message": "User created successfully",
            "user": user_out.model_dump(mode="json"),
            "user": _user_to_read(user).model_dump(mode="json"),
        },
    )


@router.post("/login")
async def login_user(payload: UserLogin, db: AsyncSession = Depends(get_db)):
   
    user = await db.scalar(select(User).where(User.email == payload.email))
    if not user:
        return JSONResponse(
            status_code=401,
            content={"message": "Invalid credentials"},
        )

    
    if not bcrypt.checkpw(
        payload.password.encode("utf-8"),
        user.password_hash.encode("utf-8"),
    ):
        return JSONResponse(
            status_code=401,
            content={"message": "Invalid credentials"},
        )

    
    token = create_access_token(
        {"userId": str(user.id), "email": user.email},
        expires_delta=timedelta(days=1),
    )

    response = JSONResponse(
        status_code=200,
        content={"message": "Login successful"},
    )

    
    response.set_cookie(
        key="auth_token",
        value=token,
        httponly=True,
        secure=False,  
        samesite="lax",
        max_age=60 * 60 * 24, 
        path="/",
    )

    return response


@router.get("/me")
async def get_me(request: Request, db: AsyncSession = Depends(get_db)):
    
    token = request.cookies.get("auth_token")
    token = _extract_token(request)
    if not token:
        return JSONResponse(status_code=401, content={"message": "Not authenticated"})

    
    decoded = verify_access_token(token)
    if not decoded or "userId" not in decoded:
        return JSONResponse(status_code=401, content={"message": "Invalid token"})

    user_id = decoded["userId"]

    
    user = await db.get(User, user_id)
    if not user:
        return JSONResponse(
            status_code=404,
            content={"message": "User not found"},
        )

    
    user_out = UserRead(
        id=user.id,
        name=user.name,
        email=user.email,
        major=user.major,
        group=user.group,
        gpa=user.gpa,
        study_goal=user.study_goal,
        weak_subjects=user.weak_subjects,
        study_hours_per_week=user.study_hours_per_week,
        createdAt=user.created_at,
    )

    return JSONResponse(
        status_code=200,
        content={"user": user_out.model_dump(mode="json")},
    user = await db.get(User, decoded["userId"])
    if not user:
        return JSONResponse(status_code=404, content={"message": "User not found"})

    return JSONResponse(
        status_code=200,
        content={"user": _user_to_read(user).model_dump(mode="json")},
    )


@router.patch("/me")
async def update_me(
    request: Request,
    payload: UserUpdate,
    db: AsyncSession = Depends(get_db),
):
    token = _extract_token(request)
    if not token:
        return JSONResponse(status_code=401, content={"message": "Not authenticated"})

    decoded = verify_access_token(token)
    if not decoded or "userId" not in decoded:
        return JSONResponse(status_code=401, content={"message": "Invalid token"})

    user = await db.get(User, decoded["userId"])
    if not user:
        return JSONResponse(status_code=404, content={"message": "User not found"})

    # Применяем только переданные поля (partial update)
    if payload.name is not None:
        user.name = payload.name
    if payload.major is not None:
        user.major = payload.major
    if payload.group is not None:
        user.group = payload.group
    if payload.gpa is not None:
        user.gpa = payload.gpa
    if payload.study_goal is not None:
        user.study_goal = payload.study_goal
    if payload.weak_subjects is not None:
        user.weak_subjects = payload.weak_subjects
    if payload.study_hours_per_week is not None:
        user.study_hours_per_week = payload.study_hours_per_week

    await db.commit()
    await db.refresh(user)

    return JSONResponse(
        status_code=200,
        content={
            "message": "Profile updated successfully",
            "user": _user_to_read(user).model_dump(mode="json"),
        },
    )