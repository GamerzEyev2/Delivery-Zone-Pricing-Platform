from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.db.base import Base
from app.db.session import engine, SessionLocal
from app.api.v1.router import router as v1_router

from app.models.user import User
from app.models.warehouse import Warehouse
from app.models.pricing import PricingSlab
from app.models.zone import Zone
from app.models.vehicle import Vehicle
from app.core.security import hash_password


app = FastAPI(title=settings.APP_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_list(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(v1_router)


# ✅ Root route so / doesn't show 404
@app.get("/")
def root():
    return {
        "name": settings.APP_NAME,
        "status": "running",
        "docs": "/docs",
        "redoc": "/redoc",
    }


@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # seed admin
        admin = db.query(User).filter(User.email == settings.SEED_ADMIN_EMAIL).first()
        if not admin:
            admin = User(
                email=settings.SEED_ADMIN_EMAIL,
                hashed_password=hash_password(settings.SEED_ADMIN_PASSWORD),
                role="ADMIN",
                is_active=True,
            )
            db.add(admin)
            db.commit()

        # seed demo data
        if settings.SEED_DEMO == 1:
            wh = db.query(Warehouse).first()
            if not wh:
                wh = Warehouse(
                    name="Delhi Fulfillment Center",
                    city="New Delhi",
                    lat=28.6139,
                    lng=77.2090,
                    is_active=True,
                )
                db.add(wh)
                db.commit()
                db.refresh(wh)

            if (
                db.query(PricingSlab).filter(PricingSlab.warehouse_id == wh.id).count()
                == 0
            ):
                slabs = [
                    PricingSlab(
                        warehouse_id=wh.id,
                        name="0–5 km",
                        min_km=0,
                        max_km=5,
                        flat_fee=30,
                        per_km_fee=8,
                        currency="INR",
                        is_active=True,
                    ),
                    PricingSlab(
                        warehouse_id=wh.id,
                        name="5–12 km",
                        min_km=5,
                        max_km=12,
                        flat_fee=45,
                        per_km_fee=10,
                        currency="INR",
                        is_active=True,
                    ),
                    PricingSlab(
                        warehouse_id=wh.id,
                        name="12–25 km",
                        min_km=12,
                        max_km=25,
                        flat_fee=70,
                        per_km_fee=12,
                        currency="INR",
                        is_active=True,
                    ),
                ]
                db.add_all(slabs)
                db.commit()

            if db.query(Zone).filter(Zone.warehouse_id == wh.id).count() == 0:
                # simple rectangle around central delhi (must be closed)
                coords = [
                    [28.7041, 77.1025],
                    [28.7041, 77.2800],
                    [28.5200, 77.2800],
                    [28.5200, 77.1025],
                    [28.7041, 77.1025],
                ]
                z = Zone(
                    warehouse_id=wh.id,
                    name="Central Delhi Zone",
                    color="#7C3AED",
                    coords=coords,
                    is_active=True,
                )
                db.add(z)
                db.commit()

            # Seed vehicles
            if db.query(Vehicle).count() == 0:
                vehicles = [
                    Vehicle(
                        name="Two Wheeler",
                        icon="bike",
                        max_weight_kg=10,
                        base_fare=20,
                        per_km_rate=8,
                        per_kg_rate=2,
                        is_active=True,
                        display_order=1,
                    ),
                    Vehicle(
                        name="Auto Rickshaw",
                        icon="auto",
                        max_weight_kg=50,
                        base_fare=50,
                        per_km_rate=12,
                        per_kg_rate=3,
                        is_active=True,
                        display_order=2,
                    ),
                    Vehicle(
                        name="Mini Truck",
                        icon="truck",
                        max_weight_kg=500,
                        base_fare=100,
                        per_km_rate=15,
                        per_kg_rate=5,
                        is_active=True,
                        display_order=3,
                    ),
                ]
                db.add_all(vehicles)
                db.commit()

    finally:
        db.close()
