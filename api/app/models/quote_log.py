from datetime import datetime
from sqlalchemy import Float, String, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func
from app.db.base import Base


class QuoteLog(Base):
    __tablename__ = "quote_logs"

    id: Mapped[int] = mapped_column(primary_key=True)
    warehouse_id: Mapped[int] = mapped_column(ForeignKey("warehouses.id"), index=True)

    dest_lat: Mapped[float] = mapped_column(Float)
    dest_lng: Mapped[float] = mapped_column(Float)

    matched_zone_id: Mapped[int | None] = mapped_column(nullable=True)
    distance_km: Mapped[float] = mapped_column(Float)
    price: Mapped[float] = mapped_column(Float)
    currency: Mapped[str] = mapped_column(String(10), default="INR")

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), index=True
    )
