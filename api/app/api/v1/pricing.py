from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.v1.deps import get_db, require_admin
from app.schemas.pricing import PricingCreate, PricingOut
from app.schemas.versions import PricingVersionOut
from app.models.pricing import PricingSlab
from app.models.pricing_version import PricingVersion
from app.services.audit import log_audit, create_pricing_version, pricing_snapshot
from app.services.cache import quote_cache

router = APIRouter(prefix="/pricing")


@router.get("", response_model=list[PricingOut])
def list_slabs(warehouse_id: int, db: Session = Depends(get_db)):
    return (
        db.query(PricingSlab)
        .filter(PricingSlab.warehouse_id == warehouse_id)
        .order_by(PricingSlab.min_km.asc())
        .all()
    )


@router.post("", response_model=PricingOut)
def create_slab(
    payload: PricingCreate, db: Session = Depends(get_db), admin=Depends(require_admin)
):
    slab = PricingSlab(**payload.model_dump(), is_active=True)
    db.add(slab)
    db.commit()
    db.refresh(slab)
    create_pricing_version(db, slab, admin.id, "CREATE")
    log_audit(db, admin.id, "CREATE", "PRICING", slab.id, None, pricing_snapshot(slab))
    db.commit()
    quote_cache.clear()
    return slab


@router.patch("/{slab_id}", response_model=PricingOut)
def update_slab(
    slab_id: int,
    payload: PricingCreate,
    db: Session = Depends(get_db),
    admin=Depends(require_admin),
):
    slab = db.query(PricingSlab).filter(PricingSlab.id == slab_id).first()
    if not slab:
        raise HTTPException(404, "Slab not found")
    before = pricing_snapshot(slab)
    for k, v in payload.model_dump().items():
        setattr(slab, k, v)
    slab.is_active = True
    db.commit()
    db.refresh(slab)
    create_pricing_version(db, slab, admin.id, "UPDATE")
    log_audit(
        db, admin.id, "UPDATE", "PRICING", slab.id, before, pricing_snapshot(slab)
    )
    db.commit()
    quote_cache.clear()
    return slab


@router.delete("/{slab_id}")
def disable_slab(
    slab_id: int, db: Session = Depends(get_db), admin=Depends(require_admin)
):
    slab = db.query(PricingSlab).filter(PricingSlab.id == slab_id).first()
    if not slab:
        raise HTTPException(404, "Slab not found")
    before = pricing_snapshot(slab)
    slab.is_active = False
    db.commit()
    db.refresh(slab)
    create_pricing_version(db, slab, admin.id, "DISABLE")
    log_audit(
        db, admin.id, "DISABLE", "PRICING", slab.id, before, pricing_snapshot(slab)
    )
    db.commit()
    quote_cache.clear()
    return {"ok": True}


@router.get("/{slab_id}/versions", response_model=list[PricingVersionOut])
def slab_versions(
    slab_id: int, db: Session = Depends(get_db), _=Depends(require_admin)
):
    return (
        db.query(PricingVersion)
        .filter(PricingVersion.pricing_id == slab_id)
        .order_by(PricingVersion.version.desc())
        .all()
    )
