from pydantic import BaseModel, field_validator
from typing import List

Point = List[float]  # [lat, lng]


class ZoneCreate(BaseModel):
    warehouse_id: int
    name: str
    color: str = "#7C3AED"
    coords: List[Point]

    @field_validator("coords")
    @classmethod
    def validate_polygon(cls, v: List[Point]):
        if len(v) < 4:
            raise ValueError("coords must have at least 4 points (closed polygon)")
        for p in v:
            if len(p) != 2:
                raise ValueError("each point must be [lat, lng]")
        if v[0] != v[-1]:
            raise ValueError(
                "polygon must be closed: first point must equal last point"
            )
        return v


class ZoneOut(BaseModel):
    id: int
    warehouse_id: int
    name: str
    color: str
    coords: List[Point]
    is_active: bool
