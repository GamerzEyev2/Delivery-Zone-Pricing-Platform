from typing import Optional

from pydantic import BaseModel, Field


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


class ItemCreate(BaseModel):
    category: str = Field(..., example="Electronics")
    name: str = Field(..., example="iPhone 15")
    weight_kg: float = Field(..., gt=0, example=0.5)
    length_cm: Optional[float] = None
    width_cm: Optional[float] = None
    height_cm: Optional[float] = None
    notes: Optional[str] = None


class ItemOut(ItemCreate):
    id: int
    image_url: Optional[str] = None

    class Config:
        from_attributes = True


class OrderCreate(BaseModel):
    # Locations
    pickup_address: str
    pickup_lat: float = Field(..., ge=-90, le=90)
    pickup_lng: float = Field(..., ge=-180, le=180)

    delivery_address: str
    delivery_lat: float = Field(..., ge=-90, le=90)
    delivery_lng: float = Field(..., ge=-180, le=180)

    # Item
    item_category: str
    item_name: str
    item_weight_kg: float = Field(..., gt=0)
    item_notes: Optional[str] = None

    # Vehicle
    vehicle_id: int

    # Customer
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    customer_email: Optional[str] = None

    special_requests: Optional[str] = None


class OrderOut(BaseModel):
    id: int
    pickup_address: str
    pickup_lat: float
    pickup_lng: float

    delivery_address: str
    delivery_lat: float
    delivery_lng: float

    item_category: str
    item_name: str
    item_weight_kg: float
    item_image_url: Optional[str] = None
    item_notes: Optional[str] = None

    vehicle_id: int
    vehicle_name: str

    distance_km: float
    zone: Optional[str] = None

    base_fare: float
    distance_charge: float
    weight_charge: float
    zone_multiplier: float
    total_price: float
    currency: str

    status: str
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    customer_email: Optional[str] = None
    special_requests: Optional[str] = None

    created_at: Optional[str] = None
