from pydantic import BaseModel, field_validator


class PricingCreate(BaseModel):
    warehouse_id: int
    name: str = "Standard"
    min_km: float
    max_km: float
    flat_fee: float
    per_km_fee: float
    currency: str = "INR"

    @field_validator("max_km")
    @classmethod
    def max_gt_min(cls, v: float, info):
        min_km = info.data.get("min_km", 0)
        if v <= min_km:
            raise ValueError("max_km must be > min_km")
        return v


class PricingOut(BaseModel):
    id: int
    warehouse_id: int
    name: str
    min_km: float
    max_km: float
    flat_fee: float
    per_km_fee: float
    currency: str
    is_active: bool
