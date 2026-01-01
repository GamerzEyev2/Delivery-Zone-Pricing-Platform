from pydantic import BaseModel, field_validator


class WarehouseCreate(BaseModel):
    name: str
    city: str = ""
    lat: float
    lng: float

    @field_validator("lat")
    @classmethod
    def lat_ok(cls, v: float):
        if not (-90 <= v <= 90):
            raise ValueError("lat must be between -90 and 90")
        return v

    @field_validator("lng")
    @classmethod
    def lng_ok(cls, v: float):
        if not (-180 <= v <= 180):
            raise ValueError("lng must be between -180 and 180")
        return v


class WarehouseOut(BaseModel):
    id: int
    name: str
    city: str
    lat: float
    lng: float
    is_active: bool
