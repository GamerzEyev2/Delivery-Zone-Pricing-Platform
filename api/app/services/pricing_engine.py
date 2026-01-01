from sqlalchemy.orm import Session
from app.models.zone import Zone
from app.models.pricing import PricingSlab
from app.services.geo import point_in_polygon, haversine_km


def find_zone(
    db: Session, warehouse_id: int, dest_lat: float, dest_lng: float
) -> Zone | None:
    zones = (
        db.query(Zone)
        .filter(Zone.warehouse_id == warehouse_id, Zone.is_active == True)
        .all()
    )
    for z in zones:
        if point_in_polygon([dest_lat, dest_lng], z.coords):
            return z
    return None


def find_slab(db: Session, warehouse_id: int, distance_km: float) -> PricingSlab | None:
    slabs = (
        db.query(PricingSlab)
        .filter(PricingSlab.warehouse_id == warehouse_id, PricingSlab.is_active == True)
        .order_by(PricingSlab.min_km.asc())
        .all()
    )
    for s in slabs:
        if s.min_km <= distance_km <= s.max_km:
            return s
    return slabs[-1] if slabs else None


def compute_price(distance_km: float, slab: PricingSlab) -> float:
    billable_km = max(0.0, distance_km - slab.min_km)
    return float(slab.flat_fee + billable_km * slab.per_km_fee)


def compute_quote(db: Session, warehouse, dest_lat: float, dest_lng: float):
    zone = find_zone(db, warehouse.id, dest_lat, dest_lng)
    distance_km = haversine_km(warehouse.lat, warehouse.lng, dest_lat, dest_lng)
    slab = find_slab(db, warehouse.id, distance_km)

    if not zone or not slab:
        return {
            "serviceable": False,
            "matched_zone": None,
            "distance_km": round(distance_km, 3),
            "price": 0.0,
            "currency": slab.currency if slab else "INR",
            "slab_name": slab.name if slab else None,
        }

    price = compute_price(distance_km, slab)
    return {
        "serviceable": True,
        "matched_zone": zone.name,
        "distance_km": round(distance_km, 3),
        "price": round(price, 2),
        "currency": slab.currency,
        "slab_name": slab.name,
    }
