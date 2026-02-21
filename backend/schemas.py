import os
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional
from uuid import UUID

from jose import JWTError, jwt
from pydantic import BaseModel, EmailStr

JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret-key")
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_MINUTES = 60 * 24


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserRead(BaseModel):
    id: UUID
    name: str
    email: str
    major: str
    group: str
    gpa: float
    # для персонализации 
    study_goal: str
    weak_subjects: List[str]
    study_hours_per_week: int
    createdAt: datetime
    

def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta if expires_delta is not None else timedelta(minutes=JWT_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)


def verify_access_token(token: str) -> Optional[Dict[str, Any]]:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except JWTError:
        return None


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: List[ChatMessage]


class QuizGenerateRequest(BaseModel):
    type: str
    documentText: Optional[str] = None


class QuizChatRequest(BaseModel):
    messages: List[ChatMessage]
    documentText: Optional[str] = None
