from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.v1.deps import get_db
from app.schemas.vehicle import VehicleOut, VehicleCreate
from app.models.vehicle import Vehicle

router = APIRouter(prefix="/vehicles")


@router.get("", response_model=list[VehicleOut])
def list_vehicles(db: Session = Depends(get_db)):
    """Get all active vehicles"""
    return (
        db.query(Vehicle)
        .filter(Vehicle.is_active == True)
        .order_by(Vehicle.display_order.asc())
        .all()
    )


@router.get("/{vehicle_id}", response_model=VehicleOut)
def get_vehicle(vehicle_id: int, db: Session = Depends(get_db)):
    """Get a specific vehicle"""
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(404, "Vehicle not found")
    return vehicle
