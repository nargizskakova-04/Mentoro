import os
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional
from uuid import UUID

from jose import JWTError, jwt
from pydantic import BaseModel, EmailStr

JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret-key")
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_MINUTES = 60 * 24


# ─── Auth ────────────────────────────────────────────────────────────────────

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
    study_goal: str
    weak_subjects: List[str]
    study_hours_per_week: int
    createdAt: datetime


class QuizHistoryCreate(BaseModel):
    topic: str
    score: int
    total_questions: int


class QuizHistoryRead(BaseModel):
    id: int
    topic: str
    score: int
    total_questions: int
    percentage: int
    createdAt: datetime


class UserUpdate(BaseModel):
    name: Optional[str] = None
    major: Optional[str] = None
    group: Optional[str] = None
    gpa: Optional[float] = None
    study_goal: Optional[str] = None
    weak_subjects: Optional[List[str]] = None
    study_hours_per_week: Optional[int] = None


# ─── JWT ─────────────────────────────────────────────────────────────────────

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


# ─── AI Chat ─────────────────────────────────────────────────────────────────

class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: List[ChatMessage]


# ─── Quizzes ─────────────────────────────────────────────────────────────────

class QuizGenerateRequest(BaseModel):
    type: str
    documentText: Optional[str] = None


class QuizChatRequest(BaseModel):
    messages: List[ChatMessage]
    documentText: Optional[str] = None
    documentText: Optional[str] = None


# ─── Assignments ─────────────────────────────────────────────────────────────

class AssignmentCreate(BaseModel):
    title: str
    course: str
    status: Optional[str] = "Pending"
    score: Optional[str] = "-"


class AssignmentUpdate(BaseModel):
    title: Optional[str] = None
    course: Optional[str] = None
    status: Optional[str] = None
    score: Optional[str] = None


class AssignmentRead(BaseModel):
    id: UUID
    user_id: UUID
    title: str
    course: str
    status: str
    score: Optional[str] = "-"
    createdAt: datetime
