from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models.warehouse import Warehouse, Location
from app.models.stock import StockQuant
from app.schemas.warehouse import (
    WarehouseCreate,
    WarehouseUpdate,
    WarehouseResponse,
    LocationCreate,
    LocationUpdate,
    LocationResponse
)
from app.schemas.auth import MessageResponse
from app.utils.dependencies import get_current_user, require_manager

router = APIRouter(tags=["Warehouses & Locations"])

# ----------------- WAREHOUSE ENDPOINTS -----------------

@router.get("/api/warehouses", response_model=List[WarehouseResponse])
def get_warehouses(
    active_only: bool = False,
    db: Session = Depends(get_db)
):
    query = db.query(Warehouse)
    if active_only:
        query = query.filter(Warehouse.is_active == True)
    warehouses = query.order_by(Warehouse.name.asc()).all()

    results = []
    for wh in warehouses:
        loc_count = len(wh.locations) if wh.locations else 0
        locs = [
            LocationResponse(
                id=l.id,
                warehouse_id=l.warehouse_id,
                warehouse_name=wh.name,
                name=l.name,
                code=l.code,
                type=l.type
            ) for l in wh.locations
        ]
        results.append(WarehouseResponse(
            id=wh.id,
            name=wh.name,
            code=wh.code,
            address=wh.address,
            is_active=wh.is_active,
            location_count=loc_count,
            locations=locs
        ))
    return results

@router.post("/api/warehouses", response_model=WarehouseResponse, status_code=status.HTTP_201_CREATED)
def create_warehouse(
    req: WarehouseCreate,
    db: Session = Depends(get_db),
    user=Depends(require_manager)
):
    clean_code = req.code.strip().upper()
    existing = db.query(Warehouse).filter(Warehouse.code.ilike(clean_code)).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Warehouse with code '{clean_code}' already exists")

    wh = Warehouse(
        name=req.name.strip(),
        code=clean_code,
        address=req.address,
        is_active=req.is_active
    )
    db.add(wh)
    db.commit()
    db.refresh(wh)

    # Automatically create a default internal location for this warehouse
    default_loc = Location(
        warehouse_id=wh.id,
        name="Main Storage",
        code=f"{clean_code}-MAIN",
        type="internal"
    )
    db.add(default_loc)
    db.commit()
    db.refresh(wh)

    locs = [
        LocationResponse(
            id=default_loc.id,
            warehouse_id=wh.id,
            warehouse_name=wh.name,
            name=default_loc.name,
            code=default_loc.code,
            type=default_loc.type
        )
    ]
    return WarehouseResponse(
        id=wh.id,
        name=wh.name,
        code=wh.code,
        address=wh.address,
        is_active=wh.is_active,
        location_count=1,
        locations=locs
    )

@router.get("/api/warehouses/{warehouse_id}", response_model=WarehouseResponse)
def get_warehouse_detail(warehouse_id: int, db: Session = Depends(get_db)):
    wh = db.query(Warehouse).filter(Warehouse.id == warehouse_id).first()
    if not wh:
        raise HTTPException(status_code=404, detail="Warehouse not found")

    locs = [
        LocationResponse(
            id=l.id,
            warehouse_id=l.warehouse_id,
            warehouse_name=wh.name,
            name=l.name,
            code=l.code,
            type=l.type
        ) for l in wh.locations
    ]
    return WarehouseResponse(
        id=wh.id,
        name=wh.name,
        code=wh.code,
        address=wh.address,
        is_active=wh.is_active,
        location_count=len(locs),
        locations=locs
    )

@router.put("/api/warehouses/{warehouse_id}", response_model=WarehouseResponse)
def update_warehouse(
    warehouse_id: int,
    req: WarehouseUpdate,
    db: Session = Depends(get_db),
    user=Depends(require_manager)
):
    wh = db.query(Warehouse).filter(Warehouse.id == warehouse_id).first()
    if not wh:
        raise HTTPException(status_code=404, detail="Warehouse not found")

    if req.code is not None:
        clean_code = req.code.strip().upper()
        existing = db.query(Warehouse).filter(Warehouse.code.ilike(clean_code), Warehouse.id != warehouse_id).first()
        if existing:
            raise HTTPException(status_code=400, detail=f"Another warehouse with code '{clean_code}' already exists")
        wh.code = clean_code

    if req.name is not None:
        wh.name = req.name.strip()
    if req.address is not None:
        wh.address = req.address
    if req.is_active is not None:
        wh.is_active = req.is_active

    db.commit()
    db.refresh(wh)

    locs = [
        LocationResponse(
            id=l.id,
            warehouse_id=l.warehouse_id,
            warehouse_name=wh.name,
            name=l.name,
            code=l.code,
            type=l.type
        ) for l in wh.locations
    ]
    return WarehouseResponse(
        id=wh.id,
        name=wh.name,
        code=wh.code,
        address=wh.address,
        is_active=wh.is_active,
        location_count=len(locs),
        locations=locs
    )

@router.delete("/api/warehouses/{warehouse_id}", response_model=MessageResponse)
def delete_warehouse(
    warehouse_id: int,
    db: Session = Depends(get_db),
    user=Depends(require_manager)
):
    wh = db.query(Warehouse).filter(Warehouse.id == warehouse_id).first()
    if not wh:
        raise HTTPException(status_code=404, detail="Warehouse not found")

    # Check for non-zero stock quants in any of this warehouse's locations
    loc_ids = [l.id for l in wh.locations]
    existing_stock = db.query(StockQuant).filter(StockQuant.location_id.in_(loc_ids), StockQuant.quantity > 0).first()
    if existing_stock:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete warehouse with active non-zero inventory"
        )

    db.delete(wh)
    db.commit()
    return MessageResponse(message=f"Warehouse '{wh.name}' deleted successfully")

# ----------------- LOCATION ENDPOINTS -----------------

@router.get("/api/locations", response_model=List[LocationResponse])
def get_locations(
    warehouse_id: Optional[int] = Query(None, description="Filter by warehouse ID"),
    type: Optional[str] = Query(None, description="Filter by location type: internal, vendor, customer"),
    db: Session = Depends(get_db)
):
    query = db.query(Location)
    if warehouse_id:
        query = query.filter(Location.warehouse_id == warehouse_id)
    if type:
        query = query.filter(Location.type == type.lower())
    locations = query.order_by(Location.name.asc()).all()

    return [
        LocationResponse(
            id=l.id,
            warehouse_id=l.warehouse_id,
            warehouse_name=l.warehouse.name if l.warehouse else None,
            name=l.name,
            code=l.code,
            type=l.type
        ) for l in locations
    ]

@router.get("/api/warehouses/{warehouse_id}/locations", response_model=List[LocationResponse])
def get_warehouse_locations(warehouse_id: int, db: Session = Depends(get_db)):
    wh = db.query(Warehouse).filter(Warehouse.id == warehouse_id).first()
    if not wh:
        raise HTTPException(status_code=404, detail="Warehouse not found")
    return [
        LocationResponse(
            id=l.id,
            warehouse_id=l.warehouse_id,
            warehouse_name=wh.name,
            name=l.name,
            code=l.code,
            type=l.type
        ) for l in wh.locations
    ]

@router.post("/api/locations", response_model=LocationResponse, status_code=status.HTTP_201_CREATED)
def create_location(
    req: LocationCreate,
    db: Session = Depends(get_db),
    user=Depends(require_manager)
):
    wh = db.query(Warehouse).filter(Warehouse.id == req.warehouse_id).first()
    if not wh:
        raise HTTPException(status_code=400, detail="Specified warehouse does not exist")

    loc = Location(
        warehouse_id=req.warehouse_id,
        name=req.name.strip(),
        code=req.code.strip().upper(),
        type=req.type.lower() if req.type else "internal"
    )
    db.add(loc)
    db.commit()
    db.refresh(loc)

    return LocationResponse(
        id=loc.id,
        warehouse_id=loc.warehouse_id,
        warehouse_name=wh.name,
        name=loc.name,
        code=loc.code,
        type=loc.type
    )

@router.get("/api/locations/{location_id}", response_model=LocationResponse)
def get_location_detail(location_id: int, db: Session = Depends(get_db)):
    loc = db.query(Location).filter(Location.id == location_id).first()
    if not loc:
        raise HTTPException(status_code=404, detail="Location not found")
    return LocationResponse(
        id=loc.id,
        warehouse_id=loc.warehouse_id,
        warehouse_name=loc.warehouse.name if loc.warehouse else None,
        name=loc.name,
        code=loc.code,
        type=loc.type
    )

@router.put("/api/locations/{location_id}", response_model=LocationResponse)
def update_location(
    location_id: int,
    req: LocationUpdate,
    db: Session = Depends(get_db),
    user=Depends(require_manager)
):
    loc = db.query(Location).filter(Location.id == location_id).first()
    if not loc:
        raise HTTPException(status_code=404, detail="Location not found")

    if req.name is not None:
        loc.name = req.name.strip()
    if req.code is not None:
        loc.code = req.code.strip().upper()
    if req.type is not None:
        loc.type = req.type.lower()

    db.commit()
    db.refresh(loc)

    return LocationResponse(
        id=loc.id,
        warehouse_id=loc.warehouse_id,
        warehouse_name=loc.warehouse.name if loc.warehouse else None,
        name=loc.name,
        code=loc.code,
        type=loc.type
    )

@router.delete("/api/locations/{location_id}", response_model=MessageResponse)
def delete_location(
    location_id: int,
    db: Session = Depends(get_db),
    user=Depends(require_manager)
):
    loc = db.query(Location).filter(Location.id == location_id).first()
    if not loc:
        raise HTTPException(status_code=404, detail="Location not found")

    # Check stock in location
    has_stock = db.query(StockQuant).filter(StockQuant.location_id == location_id, StockQuant.quantity > 0).first()
    if has_stock:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete location containing active inventory"
        )

    db.delete(loc)
    db.commit()
    return MessageResponse(message=f"Location '{loc.name}' deleted successfully")
