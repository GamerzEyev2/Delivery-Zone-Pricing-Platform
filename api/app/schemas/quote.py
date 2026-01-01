from pydantic import BaseModel, field_validator


class QuoteIn(BaseModel):
    warehouse_id: int
    dest_lat: float
    dest_lng: float

    @field_validator("dest_lat")
    @classmethod
    def lat_ok(cls, v: float):
        if not (-90 <= v <= 90):
            raise ValueError("dest_lat must be between -90 and 90")
        return v

    @field_validator("dest_lng")
    @classmethod
    def lng_ok(cls, v: float):
        if not (-180 <= v <= 180):
            raise ValueError("dest_lng must be between -180 and 180")
        return v


class QuoteOut(BaseModel):
    serviceable: bool
    matched_zone: str | None
    distance_km: float
    price: float
    currency: str
    slab_name: str | None
