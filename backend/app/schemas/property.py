from datetime import datetime
from typing import List

from pydantic import BaseModel, Field


class PropertyBase(BaseModel):
    slug: str
    title: str
    description: str
    price: float
    property_type: str = Field(default="apartment")
    operation: str = Field(default="sale")
    status: str = Field(default="available")
    bedrooms: int | None = None
    bathrooms: int | None = None
    parking_spaces: int | None = None
    area: float | None = None
    address_line: str
    city: str
    state: str
    country: str = "Brasil"
    latitude: float | None = None
    longitude: float | None = None
    cover_image_url: str | None = None
    gallery: List[str] = Field(default_factory=list)
    amenities: List[str] = Field(default_factory=list)
    tags: List[str] = Field(default_factory=list)


class PropertyCreate(PropertyBase):
    pass


class PropertyUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    price: float | None = None
    property_type: str | None = None
    operation: str | None = None
    status: str | None = None
    bedrooms: int | None = None
    bathrooms: int | None = None
    parking_spaces: int | None = None
    area: float | None = None
    address_line: str | None = None
    city: str | None = None
    state: str | None = None
    country: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    cover_image_url: str | None = None
    gallery: List[str] | None = None
    amenities: List[str] | None = None
    tags: List[str] | None = None


class PropertyPublic(PropertyBase):
    id: int
    created_at: datetime
    updated_at: datetime


class PropertySummary(BaseModel):
    id: int
    slug: str
    title: str
    price: float
    city: str
    state: str
    cover_image_url: str | None = None
    bedrooms: int | None = None
    bathrooms: int | None = None
    area: float | None = None


class PropertiesListResponse(BaseModel):
    data: list[PropertyPublic]
    total: int
