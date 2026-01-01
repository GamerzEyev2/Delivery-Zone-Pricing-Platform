from sqlalchemy import String, Float, Boolean
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base


class Warehouse(Base):
    __tablename__ = "warehouses"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120), index=True)
    city: Mapped[str] = mapped_column(String(80), default="")

    lat: Mapped[float] = mapped_column(Float)
    lng: Mapped[float] = mapped_column(Float)

    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
