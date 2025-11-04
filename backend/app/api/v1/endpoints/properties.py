from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func
from sqlmodel import Session, select

from app.api.deps import get_current_active_superuser, get_db
from app.models import Property
from app.schemas import PropertiesListResponse, PropertyCreate, PropertyPublic, PropertyUpdate

router = APIRouter()


@router.get("/", response_model=PropertiesListResponse)
def list_properties(
    session: Session = Depends(get_db),
    city: str | None = None,
    operation: str | None = None,
    status_filter: Annotated[str | None, Query(alias="status")] = None,
    min_price: float | None = None,
    max_price: float | None = None,
    bedrooms: int | None = None,
    limit: int = 20,
    offset: int = 0,
) -> PropertiesListResponse:
    query = select(Property)
    count_query = select(func.count(Property.id))

    filters = []
    if city:
        filters.append(Property.city == city)
    if operation:
        filters.append(Property.operation == operation)
    if status_filter:
        filters.append(Property.status == status_filter)
    if min_price is not None:
        filters.append(Property.price >= min_price)
    if max_price is not None:
        filters.append(Property.price <= max_price)
    if bedrooms is not None:
        filters.append(Property.bedrooms >= bedrooms)

    if filters:
        query = query.where(*filters)
        count_query = count_query.where(*filters)

    total = session.exec(count_query).one()
    properties = session.exec(query.offset(offset).limit(limit)).all()
    data = [PropertyPublic.model_validate(item, from_attributes=True) for item in properties]
    return PropertiesListResponse(data=data, total=total)


@router.get("/{identifier}", response_model=PropertyPublic)
def get_property(identifier: str, session: Session = Depends(get_db)) -> PropertyPublic:
    property_obj = None
    if identifier.isdigit():
        property_obj = session.get(Property, int(identifier))
    if property_obj is None:
        property_obj = session.exec(select(Property).where(Property.slug == identifier)).one_or_none()
    if property_obj is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Imóvel não encontrado")
    return PropertyPublic.model_validate(property_obj, from_attributes=True)


@router.post("/", response_model=PropertyPublic, status_code=status.HTTP_201_CREATED)
def create_property(
    payload: PropertyCreate,
    session: Session = Depends(get_db),
    _: Annotated[None, Depends(get_current_active_superuser)] = None,
) -> PropertyPublic:
    existing = session.exec(select(Property).where(Property.slug == payload.slug)).one_or_none()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Slug já utilizado")
    property_obj = Property(**payload.model_dump())
    session.add(property_obj)
    session.commit()
    session.refresh(property_obj)
    return PropertyPublic.model_validate(property_obj, from_attributes=True)


@router.put("/{property_id}", response_model=PropertyPublic)
def update_property(
    property_id: int,
    payload: PropertyUpdate,
    session: Session = Depends(get_db),
    _: Annotated[None, Depends(get_current_active_superuser)] = None,
) -> PropertyPublic:
    property_obj = session.get(Property, property_id)
    if not property_obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Imóvel não encontrado")

    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(property_obj, key, value)

    session.add(property_obj)
    session.commit()
    session.refresh(property_obj)
    return PropertyPublic.model_validate(property_obj, from_attributes=True)


@router.delete("/{property_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_property(
    property_id: int,
    session: Session = Depends(get_db),
    _: Annotated[None, Depends(get_current_active_superuser)] = None,
) -> None:
    property_obj = session.get(Property, property_id)
    if not property_obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Imóvel não encontrado")
    session.delete(property_obj)
    session.commit()
