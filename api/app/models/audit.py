from datetime import datetime
from sqlalchemy import String, Integer, DateTime, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import Column
from sqlalchemy.sql import func
from app.db.base import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[int] = mapped_column(primary_key=True)

    actor_user_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("users.id"), nullable=True, index=True
    )

    action: Mapped[str] = mapped_column(
        String(50), index=True
    )  # CREATE/UPDATE/DISABLE/IMPORT/EXPORT
    entity_type: Mapped[str] = mapped_column(String(50), index=True)  # ZONE/PRICING
    entity_id: Mapped[int | None] = mapped_column(Integer, nullable=True, index=True)

    before = Column(JSON, nullable=True)
    after = Column(JSON, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), index=True
    )
