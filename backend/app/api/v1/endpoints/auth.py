from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session, select

from app.api.deps import get_current_user, get_db
from app.core.config import settings
from app.core.security import create_access_token, verify_password
from app.models import User
from app.schemas import Token, UserPublic

router = APIRouter()


@router.post("/login", response_model=Token)
def login_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    session: Session = Depends(get_db),
) -> Token:
    user = session.exec(select(User).where(User.email == form_data.username)).one_or_none()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Credenciais inválidas")

    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    token, expires_at = create_access_token(str(user.id), expires_delta=access_token_expires)
    return Token(access_token=token, expires_at=expires_at)


@router.get("/me", response_model=UserPublic)
def read_users_me(current_user: User = Depends(get_current_user)) -> UserPublic:
    return UserPublic.model_validate(current_user, from_attributes=True)
