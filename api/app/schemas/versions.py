from pydantic import BaseModel


class ZoneVersionOut(BaseModel):
    id: int
    zone_id: int
    version: int
    action: str
    actor_user_id: int | None
    snapshot: dict
    created_at: str


class PricingVersionOut(BaseModel):
    id: int
    pricing_id: int
    version: int
    action: str
    actor_user_id: int | None
    snapshot: dict
    created_at: str
