from datetime import datetime
from sqlalchemy import String, Float, Integer, ForeignKey, Text, DateTime, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from app.db.base import Base


class Order(Base):
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(primary_key=True)

    # Locations
    pickup_address: Mapped[str] = mapped_column(String(500))
    pickup_lat: Mapped[float] = mapped_column(Float)
    pickup_lng: Mapped[float] = mapped_column(Float)

    delivery_address: Mapped[str] = mapped_column(String(500))
    delivery_lat: Mapped[float] = mapped_column(Float)
    delivery_lng: Mapped[float] = mapped_column(Float)

    # Item details
    item_category: Mapped[str] = mapped_column(String(100), index=True)
    item_name: Mapped[str] = mapped_column(String(255))
    item_weight_kg: Mapped[float] = mapped_column(Float)
    item_image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    item_notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Vehicle selection
    vehicle_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("vehicles.id"), index=True
    )
    vehicle_name: Mapped[str] = mapped_column(String(100))  # Denormalized for display

    # Calculated values
    distance_km: Mapped[float] = mapped_column(Float)  # Calculated from coords
    zone: Mapped[str] = mapped_column(
        String(100), nullable=True
    )  # East Delhi, North Delhi, etc.

    # Pricing
    base_fare: Mapped[float] = mapped_column(Float)
    distance_charge: Mapped[float] = mapped_column(Float)
    weight_charge: Mapped[float] = mapped_column(Float)
    zone_multiplier: Mapped[float] = mapped_column(
        Float, default=1.0
    )  # 1.0x, 1.5x, etc.
    total_price: Mapped[float] = mapped_column(Float)
    currency: Mapped[str] = mapped_column(String(3), default="INR")

    # Status
    status: Mapped[str] = mapped_column(
        String(50), default="QUOTE", index=True
    )  # QUOTE, CONFIRMED, PICKED_UP, DELIVERED, CANCELLED

    # Metadata
    customer_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    customer_phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    customer_email: Mapped[str | None] = mapped_column(String(255), nullable=True)

    special_requests: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), index=True
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    def __repr__(self):
        return f"<Order {self.id}: {self.item_name} @ ₹{self.total_price}>"
