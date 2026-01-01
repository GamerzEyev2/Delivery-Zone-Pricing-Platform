from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.audit import AuditLog
from app.models.zone_version import ZoneVersion
from app.models.pricing_version import PricingVersion


def log_audit(
    db: Session, actor_user_id, action, entity_type, entity_id, before, after
):
    db.add(
        AuditLog(
            actor_user_id=actor_user_id,
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            before=before,
            after=after,
        )
    )


def zone_snapshot(zone) -> dict:
    return {
        "id": zone.id,
        "warehouse_id": zone.warehouse_id,
        "name": zone.name,
        "color": zone.color,
        "coords": zone.coords,
        "is_active": zone.is_active,
    }


def pricing_snapshot(slab) -> dict:
    return {
        "id": slab.id,
        "warehouse_id": slab.warehouse_id,
        "name": slab.name,
        "min_km": slab.min_km,
        "max_km": slab.max_km,
        "flat_fee": slab.flat_fee,
        "per_km_fee": slab.per_km_fee,
        "currency": slab.currency,
        "is_active": slab.is_active,
    }


def create_zone_version(db: Session, zone, actor_user_id, action: str):
    max_ver = (
        db.query(func.max(ZoneVersion.version))
        .filter(ZoneVersion.zone_id == zone.id)
        .scalar()
    )
    next_ver = (max_ver or 0) + 1
    db.add(
        ZoneVersion(
            zone_id=zone.id,
            version=next_ver,
            action=action,
            actor_user_id=actor_user_id,
            snapshot=zone_snapshot(zone),
        )
    )


def create_pricing_version(db: Session, slab, actor_user_id, action: str):
    max_ver = (
        db.query(func.max(PricingVersion.version))
        .filter(PricingVersion.pricing_id == slab.id)
        .scalar()
    )
    next_ver = (max_ver or 0) + 1
    db.add(
        PricingVersion(
            pricing_id=slab.id,
            version=next_ver,
            action=action,
            actor_user_id=actor_user_id,
            snapshot=pricing_snapshot(slab),
        )
    )
