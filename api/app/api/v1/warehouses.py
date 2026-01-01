from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api.v1.deps import get_db, require_admin
from app.schemas.warehouse import WarehouseCreate, WarehouseOut
from app.models.warehouse import Warehouse

router = APIRouter(prefix="/warehouses")


@router.get("", response_model=list[WarehouseOut])
def list_warehouses(db: Session = Depends(get_db)):
    return (
        db.query(Warehouse)
        .filter(Warehouse.is_active == True)
        .order_by(Warehouse.id.asc())
        .all()
    )


@router.post("", response_model=WarehouseOut)
def create_warehouse(
    payload: WarehouseCreate, db: Session = Depends(get_db), _=Depends(require_admin)
):
    wh = Warehouse(**payload.model_dump(), is_active=True)
    db.add(wh)
    db.commit()
    db.refresh(wh)
    return wh
