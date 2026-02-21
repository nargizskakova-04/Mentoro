from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional
from uuid import UUID

from jose import JWTError, jwt
from pydantic import BaseModel, ConfigDict, EmailStr, Field


JWT_SECRET = "dev-secret-key"
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_MINUTES = 60 * 24  # 1 day


class Settings(BaseModel):
    jwt_secret: str = Field(default=JWT_SECRET)
    jwt_algorithm: str = Field(default=JWT_ALGORITHM)
    jwt_expire_minutes: int = Field(default=JWT_EXPIRE_MINUTES)

    model_config = ConfigDict(arbitrary_types_allowed=True)


settings = Settings()


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
    createdAt: datetime


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta if expires_delta is not None else timedelta(minutes=settings.jwt_expire_minutes)
    )
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.jwt_secret, algorithm=settings.jwt_algorithm)
    return encoded_jwt


def verify_access_token(token: str) -> Optional[Dict[str, Any]]:
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
        return payload
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

