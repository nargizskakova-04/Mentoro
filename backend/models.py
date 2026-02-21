import uuid
from datetime import datetime

from sqlalchemy import DateTime, Float, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String, nullable=False)
    email: Mapped[str] = mapped_column(String, nullable=False, unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String, nullable=False)

    major: Mapped[str] = mapped_column(String, nullable=False, server_default="Computer Science")
    # Column name group_name to satisfy schema requirement, attribute name group for API
    group: Mapped[str] = mapped_column("group_name", String, nullable=False, server_default="CS-101")
    gpa: Mapped[float] = mapped_column(Float, nullable=False, server_default="3.5")

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

