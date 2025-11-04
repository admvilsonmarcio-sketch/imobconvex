from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel, EmailStr, Field

from app.schemas.property import PropertySummary
from app.schemas.user import UserSummary


class LeadPreferences(BaseModel):
    operation: str | None = Field(default=None, description="buy|rent")
    locations: list[str] = Field(default_factory=list)
    budget_min: float | None = None
    budget_max: float | None = None
    bedrooms: int | None = None
    additional: dict[str, Any] | None = None


class LeadBase(BaseModel):
    name: str
    email: EmailStr | None = None
    phone: str | None = None
    message: str | None = None
    source: str | None = None
    preferences: LeadPreferences | None = None
    property_id: int | None = Field(default=None, description="ID do imóvel de interesse")


class LeadCreate(LeadBase):
    pass


class LeadUpdate(BaseModel):
    status: str | None = None
    score: int | None = Field(default=None, ge=0, le=100)
    probability_to_close: float | None = Field(default=None, ge=0, le=1)
    assigned_to_id: int | None = None


class LeadRecommendation(BaseModel):
    property: PropertySummary
    match_score: float


class LeadNextAction(BaseModel):
    label: str
    channel: str
    scheduled_for: datetime | None = None


class LeadPublic(LeadBase):
    id: int
    status: str
    score: int | None = None
    probability_to_close: float | None = None
    assigned_to: UserSummary | None = None
    recommended_properties: list[LeadRecommendation] = Field(default_factory=list)
    next_best_actions: list[LeadNextAction] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime


class LeadResponse(BaseModel):
    lead: LeadPublic


class LeadsListResponse(BaseModel):
    data: list[LeadPublic]
    total: int


class LeadAcknowledgeResponse(BaseModel):
    message: str
    lead: LeadPublic
