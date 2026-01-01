from sqlalchemy import String, Float, Boolean, Integer
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base


class Vehicle(Base):
    __tablename__ = "vehicles"

    id: Mapped[int] = mapped_column(primary_key=True)

    name: Mapped[str] = mapped_column(
        String(100), index=True
    )  # "Bike", "Auto", "Truck"
    icon: Mapped[str] = mapped_column(String(50))  # emoji or icon name

    description: Mapped[str] = mapped_column(String(500), nullable=True)
    max_weight_kg: Mapped[float] = mapped_column(Float)  # Max carrying capacity

    base_fare: Mapped[float] = mapped_column(Float)  # Starting price
    per_km_rate: Mapped[float] = mapped_column(Float)  # Price per km
    per_kg_rate: Mapped[float] = mapped_column(Float)  # Price per kg of item

    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    display_order: Mapped[int] = mapped_column(Integer, default=0)

    def __repr__(self):
        return f"<Vehicle {self.name}>"
