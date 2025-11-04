from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING, Any, Optional

from sqlalchemy import Column, JSON
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:  # pragma: no cover
    from .property import Property
    from .user import User


class Lead(SQLModel, table=True):
    __tablename__ = "lead"

    id: int | None = Field(default=None, primary_key=True)
    name: str
    email: str | None = Field(default=None, index=True)
    phone: str | None = None
    message: str | None = None
    preferences: dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON, nullable=False, server_default="{}"))
    score: int | None = Field(default=None, ge=0, le=100)
    status: str = Field(default="new")
    probability_to_close: float | None = Field(default=None, ge=0, le=1)
    source: str | None = Field(default=None)

    property_id: Optional[int] = Field(default=None, foreign_key="property.id")
    assigned_to_id: Optional[int] = Field(default=None, foreign_key="user.id")

    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    property: Optional["Property"] = Relationship(back_populates="leads")
    assigned_to: Optional["User"] = Relationship(back_populates="leads")
