from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.api.v1.deps import get_db
from app.schemas.order import OrderCreate, OrderOut
from app.models.order import Order
from app.models.vehicle import Vehicle
from app.services.geo import haversine_km
from app.services.zones import get_zone_from_coords, get_zone_multiplier
from datetime import datetime

router = APIRouter(prefix="/orders")


@router.post("", response_model=OrderOut)
def create_order(payload: OrderCreate, db: Session = Depends(get_db)):
    """Create an order and get quote"""

    # Get vehicle
    vehicle = db.query(Vehicle).filter(Vehicle.id == payload.vehicle_id).first()
    if not vehicle:
        raise HTTPException(400, "Vehicle not found")

    # Check weight capacity
    if payload.item_weight_kg > vehicle.max_weight_kg:
        raise HTTPException(
            400,
            f"Item weight ({payload.item_weight_kg}kg) exceeds vehicle capacity ({vehicle.max_weight_kg}kg)",
        )

    # Calculate distance
    distance_km = haversine_km(
        payload.pickup_lat,
        payload.pickup_lng,
        payload.delivery_lat,
        payload.delivery_lng,
    )

    # Determine zone
    zone = get_zone_from_coords(payload.delivery_lat, payload.delivery_lng)
    zone_multiplier = get_zone_multiplier(zone)

    # Calculate pricing
    base_fare = vehicle.base_fare
    distance_charge = distance_km * vehicle.per_km_rate
    weight_charge = payload.item_weight_kg * vehicle.per_kg_rate

    total_price = (base_fare + distance_charge + weight_charge) * zone_multiplier

    # Create order
    order = Order(
        pickup_address=payload.pickup_address,
        pickup_lat=payload.pickup_lat,
        pickup_lng=payload.pickup_lng,
        delivery_address=payload.delivery_address,
        delivery_lat=payload.delivery_lat,
        delivery_lng=payload.delivery_lng,
        item_category=payload.item_category,
        item_name=payload.item_name,
        item_weight_kg=payload.item_weight_kg,
        item_notes=payload.item_notes,
        vehicle_id=vehicle.id,
        vehicle_name=vehicle.name,
        distance_km=distance_km,
        zone=zone,
        base_fare=base_fare,
        distance_charge=distance_charge,
        weight_charge=weight_charge,
        zone_multiplier=zone_multiplier,
        total_price=total_price,
        status="QUOTE",
        customer_name=payload.customer_name,
        customer_phone=payload.customer_phone,
        customer_email=payload.customer_email,
        special_requests=payload.special_requests,
    )

    db.add(order)
    db.commit()
    db.refresh(order)
    return order


@router.get("", response_model=list[OrderOut])
def list_orders(status: str = None, db: Session = Depends(get_db)):
    """Get all orders (optionally filter by status)"""
    q = db.query(Order).order_by(Order.created_at.desc())
    if status:
        q = q.filter(Order.status == status)
    return q.limit(100).all()


@router.get("/{order_id}", response_model=OrderOut)
def get_order(order_id: int, db: Session = Depends(get_db)):
    """Get a specific order"""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(404, "Order not found")
    return order


@router.patch("/{order_id}/status", response_model=OrderOut)
def update_order_status(order_id: int, new_status: str, db: Session = Depends(get_db)):
    """Update order status (QUOTE -> CONFIRMED -> PICKED_UP -> DELIVERED)"""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(404, "Order not found")

    valid_statuses = ["QUOTE", "CONFIRMED", "PICKED_UP", "DELIVERED", "CANCELLED"]
    if new_status not in valid_statuses:
        raise HTTPException(400, f"Invalid status. Must be one of: {valid_statuses}")

    order.status = new_status
    db.commit()
    db.refresh(order)
    return order
