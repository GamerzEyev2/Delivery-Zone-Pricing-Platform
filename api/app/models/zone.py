from sqlalchemy import String, Boolean, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Column
from app.db.base import Base


class Zone(Base):
    __tablename__ = "zones"

    id: Mapped[int] = mapped_column(primary_key=True)
    warehouse_id: Mapped[int] = mapped_column(ForeignKey("warehouses.id"), index=True)

    name: Mapped[str] = mapped_column(String(120), index=True)
    color: Mapped[str] = mapped_column(String(20), default="#7C3AED")

    coords = Column(JSON, nullable=False)  # [[lat,lng], ...] closed polygon

    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    warehouse = relationship("Warehouse")
