from sqlmodel import Session, select

from app.core.config import settings
from app.core.security import get_password_hash
from app.models import User


def init_db(session: Session) -> None:
    admin = session.exec(select(User).where(User.email == settings.first_superuser_email)).one_or_none()
    if admin:
        return

    user = User(
        email=settings.first_superuser_email,
        full_name="Administrador",  # default friendly name
        hashed_password=get_password_hash(settings.first_superuser_password),
        is_superuser=True,
    )
    session.add(user)
    session.commit()
