from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api.v1.deps import get_db, require_admin
from app.schemas.audit import AuditLogOut
from app.models.audit import AuditLog

router = APIRouter(prefix="/audit")


@router.get("", response_model=list[AuditLogOut])
def list_audit(
    limit: int = 120,
    entity_type: str | None = None,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    limit = max(1, min(limit, 300))
    q = db.query(AuditLog)
    if entity_type:
        q = q.filter(AuditLog.entity_type == entity_type.upper())
    return q.order_by(AuditLog.id.desc()).limit(limit).all()
