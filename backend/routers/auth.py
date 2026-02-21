from datetime import timedelta
from typing import Any, Dict

import bcrypt
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import JSONResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models import User
from schemas import (
    UserCreate,
    UserLogin,
    UserRead,
    create_access_token,
    verify_access_token,
)

router = APIRouter()


@router.post("/register")
async def register_user(payload: UserCreate, db: AsyncSession = Depends(get_db)):
    # Check existing user
    existing = await db.scalar(select(User).where(User.email == payload.email))
    if existing:
        return JSONResponse(
            status_code=409,
            content={"message": "User already exists"},
        )

    password_hash = bcrypt.hashpw(payload.password.encode("utf-8"), bcrypt.gensalt()).decode(
        "utf-8"
    )

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
        createdAt=user.created_at,
    )

    return JSONResponse(
        status_code=201,
        content={"message": "User created successfully", "user": user_out.model_dump(mode="json")},
    )


@router.post("/login")
async def login_user(payload: UserLogin, db: AsyncSession = Depends(get_db)):
    user = await db.scalar(select(User).where(User.email == payload.email))
    if not user:
        return JSONResponse(
            status_code=401,
            content={"message": "Invalid credentials"},
        )

    if not bcrypt.checkpw(payload.password.encode("utf-8"), user.password_hash.encode("utf-8")):
        return JSONResponse(
            status_code=401,
            content={"message": "Invalid credentials"},
        )

    token = create_access_token(
        {"userId": str(user.id), "email": user.email}, expires_delta=timedelta(days=1)
    )

    response = JSONResponse(
        status_code=200,
        content={"message": "Login successful"},
    )
    # HttpOnly auth cookie, 1 day
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

    user_out = UserRead(
        id=user.id,
        name=user.name,
        email=user.email,
        major=user.major,
        group=user.group,
        gpa=user.gpa,
        createdAt=user.created_at,
    )

    return JSONResponse(
        status_code=200,
        content={"user": user_out.model_dump(mode="json")},
    )

