from datetime import datetime
from sqlalchemy import Integer, String, DateTime, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import Column
from sqlalchemy.sql import func
from app.db.base import Base


class PricingVersion(Base):
    __tablename__ = "pricing_versions"

    id: Mapped[int] = mapped_column(primary_key=True)

    pricing_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("pricing_slabs.id"), index=True
    )
    version: Mapped[int] = mapped_column(Integer, index=True)

    action: Mapped[str] = mapped_column(String(50), index=True)
    actor_user_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("users.id"), nullable=True
    )

    snapshot = Column(JSON, nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), index=True
    )
