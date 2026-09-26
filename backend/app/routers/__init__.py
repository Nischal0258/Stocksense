from app.routers.auth import router as auth_router
from app.routers.categories import router as categories_router
from app.routers.products import router as products_router
from app.routers.receipts import router as receipts_router
from app.routers.deliveries import router as deliveries_router
from app.routers.transfers import router as transfers_router
from app.routers.adjustments import router as adjustments_router
from app.routers.dashboard import router as dashboard_router
from app.routers.moves import router as moves_router
from app.routers.warehouses import router as warehouses_router
from app.routers.profile import router as profile_router

__all__ = [
    "auth_router",
    "categories_router",
    "products_router",
    "receipts_router",
    "deliveries_router",
    "transfers_router",
    "adjustments_router",
    "dashboard_router",
    "moves_router",
    "warehouses_router",
    "profile_router",
]
