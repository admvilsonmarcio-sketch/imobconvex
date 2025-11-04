from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.api.deps import get_current_active_superuser, get_current_user, get_db
from app.core.security import get_password_hash
from app.models import User
from app.schemas import UserCreate, UserPublic, UserUpdate

router = APIRouter()


@router.post("/", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
def create_user(
    payload: UserCreate,
    session: Session = Depends(get_db),
    _: User = Depends(get_current_active_superuser),
) -> UserPublic:
    existing = session.exec(select(User).where(User.email == payload.email)).one_or_none()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="E-mail já cadastrado")
    user = User(
        email=payload.email,
        full_name=payload.full_name,
        hashed_password=get_password_hash(payload.password),
        is_superuser=payload.is_superuser,
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return UserPublic.model_validate(user, from_attributes=True)


@router.get("/me", response_model=UserPublic)
def read_current_user(current_user: User = Depends(get_current_user)) -> UserPublic:
    return UserPublic.model_validate(current_user, from_attributes=True)


@router.patch("/{user_id}", response_model=UserPublic)
def update_user(
    user_id: int,
    payload: UserUpdate,
    session: Session = Depends(get_db),
    _: User = Depends(get_current_active_superuser),
) -> UserPublic:
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuário não encontrado")

    if payload.full_name is not None:
        user.full_name = payload.full_name
    if payload.password is not None:
        user.hashed_password = get_password_hash(payload.password)
    if payload.is_active is not None:
        user.is_active = payload.is_active

    session.add(user)
    session.commit()
    session.refresh(user)
    return UserPublic.model_validate(user, from_attributes=True)
