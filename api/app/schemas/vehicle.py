from pydantic import BaseModel
from typing import Optional


class VehicleCreate(BaseModel):
    name: str
    icon: str
    description: Optional[str] = None
    max_weight_kg: float
    base_fare: float
    per_km_rate: float
    per_kg_rate: float
    is_active: bool = True
    display_order: int = 0


class VehicleOut(BaseModel):
    id: int
    name: str
    icon: str
    description: Optional[str] = None
    max_weight_kg: float
    base_fare: float
    per_km_rate: float
    per_kg_rate: float
    is_active: bool
    display_order: int

    class Config:
        from_attributes = True
