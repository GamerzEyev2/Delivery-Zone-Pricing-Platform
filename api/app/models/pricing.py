from sqlalchemy import String, Float, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


class PricingSlab(Base):
    __tablename__ = "pricing_slabs"

    id: Mapped[int] = mapped_column(primary_key=True)
    warehouse_id: Mapped[int] = mapped_column(ForeignKey("warehouses.id"), index=True)

    name: Mapped[str] = mapped_column(String(120), default="Standard")
    min_km: Mapped[float] = mapped_column(Float, default=0)
    max_km: Mapped[float] = mapped_column(Float, default=5)

    flat_fee: Mapped[float] = mapped_column(Float, default=30)
    per_km_fee: Mapped[float] = mapped_column(Float, default=8)

    currency: Mapped[str] = mapped_column(String(10), default="INR")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    warehouse = relationship("Warehouse")
