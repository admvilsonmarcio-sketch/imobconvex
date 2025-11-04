from sqlalchemy import func
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.api.deps import get_current_active_superuser, get_current_user, get_db
from app.models import Lead, Property
from app.schemas import (
    LeadAcknowledgeResponse,
    LeadCreate,
    LeadResponse,
    LeadUpdate,
    LeadsListResponse,
)
from app.services.lead_scoring import LeadScoringService

router = APIRouter()


@router.post("/", response_model=LeadAcknowledgeResponse, status_code=status.HTTP_201_CREATED)
def create_lead(payload: LeadCreate, session: Session = Depends(get_db)) -> LeadAcknowledgeResponse:
    lead = Lead(
        name=payload.name,
        email=payload.email,
        phone=payload.phone,
        message=payload.message,
        source=payload.source,
        property_id=payload.property_id,
        preferences=payload.preferences.model_dump() if payload.preferences else {},
        status="new",
    )
    if payload.property_id and not session.get(Property, payload.property_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Imóvel associado não encontrado")

    session.add(lead)
    session.commit()
    session.refresh(lead)

    scoring_service = LeadScoringService(session)
    public_lead = scoring_service.enrich(lead)

    return LeadAcknowledgeResponse(message="Lead recebido com sucesso", lead=public_lead)


@router.get("/", response_model=LeadsListResponse)
def list_leads(
    session: Session = Depends(get_db),
    _: None = Depends(get_current_active_superuser),
    status_filter: str | None = None,
    limit: int = 20,
    offset: int = 0,
) -> LeadsListResponse:
    query = select(Lead).order_by(Lead.created_at.desc())
    count_query = select(func.count(Lead.id))
    if status_filter:
        query = query.where(Lead.status == status_filter)
        count_query = count_query.where(Lead.status == status_filter)

    total = session.exec(count_query).one()
    leads = session.exec(query.offset(offset).limit(limit)).all()

    scoring_service = LeadScoringService(session)
    data = [scoring_service.to_public(lead) for lead in leads]
    return LeadsListResponse(data=data, total=total)


@router.get("/{lead_id}", response_model=LeadResponse)
def get_lead(
    lead_id: int,
    session: Session = Depends(get_db),
    _: None = Depends(get_current_user),
) -> LeadResponse:
    lead = session.get(Lead, lead_id)
    if not lead:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead não encontrado")
    scoring_service = LeadScoringService(session)
    public_lead = scoring_service.to_public(lead)
    return LeadResponse(lead=public_lead)


@router.patch("/{lead_id}", response_model=LeadResponse)
def update_lead(
    lead_id: int,
    payload: LeadUpdate,
    session: Session = Depends(get_db),
    _: None = Depends(get_current_active_superuser),
) -> LeadResponse:
    lead = session.get(Lead, lead_id)
    if not lead:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead não encontrado")

    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(lead, key, value)

    session.add(lead)
    session.commit()
    session.refresh(lead)

    scoring_service = LeadScoringService(session)
    public_lead = scoring_service.to_public(lead)
    return LeadResponse(lead=public_lead)
