from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING, List

from sqlalchemy import Column, JSON
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:  # pragma: no cover
    from .lead import Lead


class Property(SQLModel, table=True):
    __tablename__ = "property"

    id: int | None = Field(default=None, primary_key=True)
    slug: str = Field(index=True, unique=True)
    title: str = Field(index=True)
    description: str
    price: float = Field(gt=0)
    property_type: str = Field(default="apartment", description="apartment|house|land|commercial")
    operation: str = Field(default="sale", description="sale|rent")
    status: str = Field(default="available")
    bedrooms: int | None = Field(default=None, ge=0)
    bathrooms: int | None = Field(default=None, ge=0)
    parking_spaces: int | None = Field(default=None, ge=0)
    area: float | None = Field(default=None, ge=0)
    address_line: str
    city: str
    state: str
    country: str = Field(default="Brasil")
    latitude: float | None = None
    longitude: float | None = None
    cover_image_url: str | None = None
    gallery: List[str] = Field(default_factory=list, sa_column=Column(JSON, nullable=False, server_default="[]"))
    amenities: List[str] = Field(default_factory=list, sa_column=Column(JSON, nullable=False, server_default="[]"))
    tags: List[str] = Field(default_factory=list, sa_column=Column(JSON, nullable=False, server_default="[]"))
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    leads: List["Lead"] = Relationship(back_populates="property")
