from collections.abc import Generator

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from sqlmodel import Session, select

from app.core.config import settings
from app.core.security import decode_token
from app.db.session import get_session
from app.models import User

reuseable_oauth = OAuth2PasswordBearer(tokenUrl=f"{settings.api_v1_str}/auth/login")


def get_db() -> Generator[Session, None, None]:
    yield from get_session()


def get_current_user(
    token: str = Depends(reuseable_oauth),
    session: Session = Depends(get_db),
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Não foi possível validar as credenciais.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = decode_token(token)
    except JWTError as exc:  # pragma: no cover - runtime protection
        raise credentials_exception from exc

    if (subject := payload.get("sub")) is None:
        raise credentials_exception

    user = session.exec(select(User).where(User.id == int(subject))).one_or_none()
    if user is None or not user.is_active:
        raise credentials_exception
    return user


def get_current_active_superuser(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.is_superuser:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Apenas administradores")
    return current_user
