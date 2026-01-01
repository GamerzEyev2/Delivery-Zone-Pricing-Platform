from fastapi import APIRouter
from app.api.v1.auth import router as auth_router
from app.api.v1.warehouses import router as wh_router
from app.api.v1.zones import router as zone_router
from app.api.v1.pricing import router as pricing_router
from app.api.v1.quote import router as quote_router
from app.api.v1.analytics import router as analytics_router
from app.api.v1.audit import router as audit_router
from app.api.v1.vehicles import router as vehicle_router
from app.api.v1.orders import router as order_router

router = APIRouter(prefix="/api/v1")
router.include_router(auth_router, tags=["auth"])
router.include_router(wh_router, tags=["warehouses"])
router.include_router(zone_router, tags=["zones"])
router.include_router(pricing_router, tags=["pricing"])
router.include_router(quote_router, tags=["quote"])
router.include_router(analytics_router, tags=["analytics"])
router.include_router(audit_router, tags=["audit"])
router.include_router(vehicle_router, tags=["vehicles"])
router.include_router(order_router, tags=["orders"])
