from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.api.v1.deps import get_db, get_current_user
from app.schemas.auth import RegisterIn, TokenOut, UserOut
from app.models.user import User
from app.core.config import settings
from app.core.security import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth")


@router.post("/register", response_model=UserOut)
def register(payload: RegisterIn, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        email=payload.email,
        hashed_password=hash_password(payload.password),
        role="ADMIN",
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=TokenOut)
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = (
        db.query(User)
        .filter(User.email == form.username, User.is_active == True)
        .first()
    )
    if not user or not verify_password(form.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token(
        str(user.id), settings.JWT_SECRET, settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    return TokenOut(access_token=token)


@router.get("/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)):
    return user
