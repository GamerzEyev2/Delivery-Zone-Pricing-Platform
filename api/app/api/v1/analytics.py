from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.api.v1.deps import get_db
from app.schemas.analytics import QuoteLogOut, AnalyticsSummaryOut
from app.models.quote_log import QuoteLog

router = APIRouter(prefix="/analytics")


@router.get("/recent-quotes", response_model=list[QuoteLogOut])
def recent_quotes(
    limit: int = 80, warehouse_id: int | None = None, db: Session = Depends(get_db)
):
    limit = max(1, min(limit, 200))
    q = db.query(QuoteLog)
    if warehouse_id:
        q = q.filter(QuoteLog.warehouse_id == warehouse_id)
    return q.order_by(QuoteLog.id.desc()).limit(limit).all()


@router.get("/summary", response_model=AnalyticsSummaryOut)
def summary(warehouse_id: int, db: Session = Depends(get_db)):
    total = (
        db.query(func.count(QuoteLog.id))
        .filter(QuoteLog.warehouse_id == warehouse_id)
        .scalar()
        or 0
    )
    serviceable = (
        db.query(func.count(QuoteLog.id))
        .filter(
            QuoteLog.warehouse_id == warehouse_id,
            QuoteLog.matched_zone_id.isnot(None),
            QuoteLog.price > 0,
        )
        .scalar()
        or 0
    )

    avg_dist = (
        db.query(func.avg(QuoteLog.distance_km))
        .filter(QuoteLog.warehouse_id == warehouse_id)
        .scalar()
        or 0.0
    )
    avg_price = (
        db.query(func.avg(QuoteLog.price))
        .filter(QuoteLog.warehouse_id == warehouse_id)
        .scalar()
        or 0.0
    )

    top = (
        db.query(QuoteLog.matched_zone_id, func.count(QuoteLog.id).label("c"))
        .filter(
            QuoteLog.warehouse_id == warehouse_id, QuoteLog.matched_zone_id.isnot(None)
        )
        .group_by(QuoteLog.matched_zone_id)
        .order_by(func.count(QuoteLog.id).desc())
        .first()
    )
    top_zone_id = top[0] if top else None
    top_hits = int(top[1]) if top else 0

    return AnalyticsSummaryOut(
        warehouse_id=warehouse_id,
        total_quotes=int(total),
        serviceable_quotes=int(serviceable),
        avg_distance_km=float(round(avg_dist, 3)),
        avg_price=float(round(avg_price, 2)),
        top_zone_id=top_zone_id,
        top_zone_hits=top_hits,
    )
