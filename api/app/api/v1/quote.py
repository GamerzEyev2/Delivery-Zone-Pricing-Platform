from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.v1.deps import get_db
from app.schemas.quote import QuoteIn, QuoteOut
from app.models.warehouse import Warehouse
from app.models.quote_log import QuoteLog
from app.services.cache import quote_cache, cache_key
from app.services.pricing_engine import compute_quote, find_zone

router = APIRouter(prefix="/quote")


@router.post("", response_model=QuoteOut)
def quote(payload: QuoteIn, db: Session = Depends(get_db)):
    wh = (
        db.query(Warehouse)
        .filter(Warehouse.id == payload.warehouse_id, Warehouse.is_active == True)
        .first()
    )
    if not wh:
        raise HTTPException(404, "Warehouse not found")

    key = cache_key(payload.warehouse_id, payload.dest_lat, payload.dest_lng)
    if key in quote_cache:
        return quote_cache[key]

    result = compute_quote(db, wh, payload.dest_lat, payload.dest_lng)

    zone = find_zone(db, wh.id, payload.dest_lat, payload.dest_lng)
    db.add(
        QuoteLog(
            warehouse_id=wh.id,
            dest_lat=payload.dest_lat,
            dest_lng=payload.dest_lng,
            matched_zone_id=zone.id if zone else None,
            distance_km=result["distance_km"],
            price=result["price"],
            currency=result["currency"],
        )
    )
    db.commit()

    quote_cache[key] = result
    return result
