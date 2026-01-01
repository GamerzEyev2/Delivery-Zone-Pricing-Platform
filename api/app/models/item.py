from datetime import datetime
from sqlalchemy import String, Float, Integer, ForeignKey, Text, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func
from app.db.base import Base


class Item(Base):
    __tablename__ = "items"

    id: Mapped[int] = mapped_column(primary_key=True)

    category: Mapped[str] = mapped_column(
        String(100), index=True
    )  # "Electronics", "Food", "Documents", etc.
    name: Mapped[str] = mapped_column(String(255))  # Item name/description
    weight_kg: Mapped[float] = mapped_column(Float)  # Weight in kg

    length_cm: Mapped[float] = mapped_column(
        Float, nullable=True
    )  # For size calculation
    width_cm: Mapped[float] = mapped_column(Float, nullable=True)
    height_cm: Mapped[float] = mapped_column(Float, nullable=True)

    image_url: Mapped[str | None] = mapped_column(
        String(500), nullable=True
    )  # S3/upload URL

    notes: Mapped[str | None] = mapped_column(
        Text, nullable=True
    )  # Special handling instructions

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    def __repr__(self):
        return f"<Item {self.name} ({self.weight_kg}kg)>"
