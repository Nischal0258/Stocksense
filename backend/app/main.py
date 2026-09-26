from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.database import Base, engine
import app.models  # Ensure all models are registered

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create tables
    Base.metadata.create_all(bind=engine)
    yield
    # Shutdown

app = FastAPI(
    title="StockSense IMS API",
    version="1.0.0",
    description="Modular Inventory Management System API for StockSense",
    lifespan=lifespan
)

# CORS configuration for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {
        "app": "StockSense IMS API",
        "version": "1.0.0",
        "status": "online",
        "docs_url": "/docs"
    }

@app.get("/api/health")
def health_check():
    return {"status": "healthy"}

# Include routers
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


app.include_router(auth_router)
app.include_router(categories_router)
app.include_router(products_router)
app.include_router(receipts_router)
app.include_router(deliveries_router)
app.include_router(transfers_router)
app.include_router(adjustments_router)
app.include_router(dashboard_router)
app.include_router(moves_router)
app.include_router(warehouses_router)
app.include_router(profile_router)





