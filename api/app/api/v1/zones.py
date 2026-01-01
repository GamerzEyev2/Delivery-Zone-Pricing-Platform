from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.v1.deps import get_db, require_admin
from app.schemas.zone import ZoneCreate, ZoneOut
from app.schemas.versions import ZoneVersionOut
from app.models.zone import Zone
from app.models.zone_version import ZoneVersion
from app.services.audit import log_audit, create_zone_version, zone_snapshot
from app.services.cache import quote_cache

router = APIRouter(prefix="/zones")


@router.get("", response_model=list[ZoneOut])
def list_zones(warehouse_id: int, db: Session = Depends(get_db)):
    return (
        db.query(Zone)
        .filter(Zone.warehouse_id == warehouse_id)
        .order_by(Zone.id.asc())
        .all()
    )


@router.post("", response_model=ZoneOut)
def create_zone(
    payload: ZoneCreate, db: Session = Depends(get_db), admin=Depends(require_admin)
):
    z = Zone(**payload.model_dump(), is_active=True)
    db.add(z)
    db.commit()
    db.refresh(z)
    create_zone_version(db, z, admin.id, "CREATE")
    log_audit(db, admin.id, "CREATE", "ZONE", z.id, None, zone_snapshot(z))
    db.commit()
    quote_cache.clear()
    return z


@router.patch("/{zone_id}", response_model=ZoneOut)
def update_zone(
    zone_id: int,
    payload: ZoneCreate,
    db: Session = Depends(get_db),
    admin=Depends(require_admin),
):
    z = db.query(Zone).filter(Zone.id == zone_id).first()
    if not z:
        raise HTTPException(404, "Zone not found")
    before = zone_snapshot(z)
    z.warehouse_id, z.name, z.color, z.coords, z.is_active = (
        payload.warehouse_id,
        payload.name,
        payload.color,
        payload.coords,
        True,
    )
    db.commit()
    db.refresh(z)
    create_zone_version(db, z, admin.id, "UPDATE")
    log_audit(db, admin.id, "UPDATE", "ZONE", z.id, before, zone_snapshot(z))
    db.commit()
    quote_cache.clear()
    return z


@router.delete("/{zone_id}")
def disable_zone(
    zone_id: int, db: Session = Depends(get_db), admin=Depends(require_admin)
):
    z = db.query(Zone).filter(Zone.id == zone_id).first()
    if not z:
        raise HTTPException(404, "Zone not found")
    before = zone_snapshot(z)
    z.is_active = False
    db.commit()
    db.refresh(z)
    create_zone_version(db, z, admin.id, "DISABLE")
    log_audit(db, admin.id, "DISABLE", "ZONE", z.id, before, zone_snapshot(z))
    db.commit()
    quote_cache.clear()
    return {"ok": True}


@router.get("/{zone_id}/versions", response_model=list[ZoneVersionOut])
def zone_versions(
    zone_id: int, db: Session = Depends(get_db), _=Depends(require_admin)
):
    return (
        db.query(ZoneVersion)
        .filter(ZoneVersion.zone_id == zone_id)
        .order_by(ZoneVersion.version.desc())
        .all()
    )


@router.get("/export")
def export_geojson(
    warehouse_id: int, db: Session = Depends(get_db), admin=Depends(require_admin)
):
    zones = (
        db.query(Zone)
        .filter(Zone.warehouse_id == warehouse_id, Zone.is_active == True)
        .order_by(Zone.id.asc())
        .all()
    )
    features = []
    for z in zones:
        ring = [[p[1], p[0]] for p in z.coords]  # GeoJSON [lng,lat]
        features.append(
            {
                "type": "Feature",
                "properties": {
                    "zone_id": z.id,
                    "warehouse_id": z.warehouse_id,
                    "name": z.name,
                    "color": z.color,
                },
                "geometry": {"type": "Polygon", "coordinates": [ring]},
            }
        )
    log_audit(
        db,
        admin.id,
        "EXPORT",
        "ZONE",
        None,
        None,
        {"warehouse_id": warehouse_id, "count": len(zones)},
    )
    db.commit()
    return {"type": "FeatureCollection", "features": features}


@router.post("/import")
def import_geojson(
    payload: dict, db: Session = Depends(get_db), admin=Depends(require_admin)
):
    warehouse_id = int(payload.get("warehouse_id"))
    overwrite = bool(payload.get("overwrite", False))
    geojson = payload.get("geojson")
    if not geojson or geojson.get("type") != "FeatureCollection":
        raise HTTPException(400, "Invalid GeoJSON FeatureCollection")

    before_count = (
        db.query(Zone)
        .filter(Zone.warehouse_id == warehouse_id, Zone.is_active == True)
        .count()
    )

    if overwrite:
        for z in (
            db.query(Zone)
            .filter(Zone.warehouse_id == warehouse_id, Zone.is_active == True)
            .all()
        ):
            z.is_active = False
        db.commit()

    created = 0
    for f in geojson.get("features", []):
        geom = (f or {}).get("geometry") or {}
        props = (f or {}).get("properties") or {}
        if geom.get("type") != "Polygon":
            continue
        coords = geom.get("coordinates")
        if not coords or not coords[0]:
            continue
        ring = coords[0]  # [[lng,lat],...]
        internal = [[pt[1], pt[0]] for pt in ring]
        if internal[0] != internal[-1]:
            internal.append(internal[0])
        if len(internal) < 4:
            continue

        z = Zone(
            warehouse_id=warehouse_id,
            name=str(props.get("name", f"Imported Zone {created+1}")),
            color=str(props.get("color", "#7C3AED")),
            coords=internal,
            is_active=True,
        )
        db.add(z)
        db.commit()
        db.refresh(z)
        create_zone_version(db, z, admin.id, "IMPORT")
        db.commit()
        created += 1

    log_audit(
        db,
        admin.id,
        "IMPORT",
        "ZONE",
        None,
        {"warehouse_id": warehouse_id, "active_before": before_count},
        {"warehouse_id": warehouse_id, "overwrite": overwrite, "imported": created},
    )
    db.commit()
    quote_cache.clear()
    return {"ok": True, "imported": created, "active_before": before_count}
