from pydantic import BaseModel


class QuoteLogOut(BaseModel):
    id: int
    warehouse_id: int
    dest_lat: float
    dest_lng: float
    matched_zone_id: int | None
    distance_km: float
    price: float
    currency: str
    created_at: str


class AnalyticsSummaryOut(BaseModel):
    warehouse_id: int
    total_quotes: int
    serviceable_quotes: int
    avg_distance_km: float
    avg_price: float
    top_zone_id: int | None
    top_zone_hits: int
