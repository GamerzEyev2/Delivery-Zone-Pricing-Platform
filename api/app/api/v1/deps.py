from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.core.config import settings
from app.core.security import decode_token
from app.models.user import User

oauth2 = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(
    db: Session = Depends(get_db), token: str = Depends(oauth2)
) -> User:
    user_id = decode_token(token, settings.JWT_SECRET)
    user = (
        db.query(User).filter(User.id == int(user_id), User.is_active == True).first()
    )
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


def require_admin(user: User = Depends(get_current_user)) -> User:
    if not user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin only")
    return user
