from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, status
from jose import JWTError, jwt
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
ALGO = "HS256"


def _bcrypt_safe_password(password: str) -> str:
    """
    bcrypt only supports max 72 BYTES.
    If the password is longer (or contains multi-byte chars), truncate safely.
    """
    pw_bytes = password.encode("utf-8")
    if len(pw_bytes) <= 72:
        return password

    # Truncate to 72 bytes and decode back
    pw_bytes = pw_bytes[:72]
    return pw_bytes.decode("utf-8", errors="ignore")


def hash_password(password: str) -> str:
    password = _bcrypt_safe_password(password)
    return pwd_context.hash(password)


def verify_password(password: str, hashed: str) -> bool:
    password = _bcrypt_safe_password(password)
    return pwd_context.verify(password, hashed)


def create_access_token(subject: str, secret: str, expires_minutes: int) -> str:
    now = datetime.now(timezone.utc)
    exp = now + timedelta(minutes=expires_minutes)
    payload = {"sub": subject, "iat": int(now.timestamp()), "exp": exp}
    return jwt.encode(payload, secret, algorithm=ALGO)


def decode_token(token: str, secret: str) -> str:
    try:
        payload = jwt.decode(token, secret, algorithms=[ALGO])
        sub = payload.get("sub")
        if not sub:
            raise ValueError("No subject")
        return sub
    except (JWTError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )
