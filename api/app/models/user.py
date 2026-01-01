from sqlalchemy import String, Boolean
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(320), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))

    role: Mapped[str] = mapped_column(String(20), default="ADMIN", index=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    @property
    def is_admin(self) -> bool:
        return self.role.upper() == "ADMIN"
