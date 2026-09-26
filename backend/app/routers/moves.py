from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, func

from app.database import get_db
from app.models.stock import StockLedger, StockQuant
from app.models.product import Product
from app.schemas.stock import StockLedgerResponse, ReorderRuleResponse, ReorderRuleUpdate
from app.utils.dependencies import get_current_user, require_manager

router = APIRouter(tags=["Move History & Reorder Rules"])

@router.get("/api/moves", response_model=List[StockLedgerResponse])
def get_move_history(
    product_id: Optional[int] = Query(None, description="Filter by product ID"),
    location_id: Optional[int] = Query(None, description="Filter by location ID"),
    type: Optional[str] = Query(None, description="Filter by move type: receipt, delivery, transfer_in, transfer_out, adjustment"),
    from_date: Optional[datetime] = Query(None, description="Filter from timestamp"),
    to_date: Optional[datetime] = Query(None, description="Filter to timestamp"),
    search: Optional[str] = Query(None, description="Search remarks"),
    db: Session = Depends(get_db)
):
    query = db.query(StockLedger)

    if product_id:
        query = query.filter(StockLedger.product_id == product_id)
    if location_id:
        query = query.filter(StockLedger.location_id == location_id)
    if type:
        query = query.filter(StockLedger.move_type == type.lower())
    if from_date:
        query = query.filter(StockLedger.timestamp >= from_date)
    if to_date:
        query = query.filter(StockLedger.timestamp <= to_date)
    if search:
        query = query.filter(StockLedger.remarks.ilike(f"%{search.strip()}%"))

    entries = query.order_by(StockLedger.timestamp.desc()).all()
    
    results = []
    for entry in entries:
        prod = entry.product
        loc = entry.location
        wh = loc.warehouse if loc else None
        op = entry.operation
        
        results.append(StockLedgerResponse(
            id=entry.id,
            product_id=entry.product_id,
            product_name=prod.name if prod else "Unknown",
            product_sku=prod.sku if prod else "",
            product_uom=prod.unit_of_measure if prod else "units",
            location_id=entry.location_id,
            location_name=loc.name if loc else "Unknown",
            warehouse_name=wh.name if wh else "N/A",
            operation_id=entry.operation_id,
            operation_reference=op.reference if op else None,
            move_type=entry.move_type,
            qty_change=entry.qty_change,
            qty_after=entry.qty_after,
            timestamp=entry.timestamp,
            remarks=entry.remarks
        ))
    return results

@router.get("/api/reorder-rules", response_model=List[ReorderRuleResponse])
def get_reorder_rules(
    below_threshold_only: Optional[bool] = Query(False, description="Filter only items needing reorder"),
    db: Session = Depends(get_db)
):
    products = db.query(Product).order_by(Product.name.asc()).all()
    results = []
    
    for prod in products:
        total_stock = db.query(func.coalesce(func.sum(StockQuant.quantity), 0.0)).filter(
            StockQuant.product_id == prod.id
        ).scalar() or 0.0
        
        is_below = (float(total_stock) <= prod.reorder_level and prod.reorder_level > 0) or (float(total_stock) <= 0)
        
        if below_threshold_only and not is_below:
            continue
            
        results.append(ReorderRuleResponse(
            product_id=prod.id,
            product_name=prod.name,
            sku=prod.sku,
            unit_of_measure=prod.unit_of_measure,
            current_stock=float(total_stock),
            reorder_level=prod.reorder_level,
            reorder_qty=prod.reorder_qty,
            is_below_threshold=is_below
        ))
    return results

@router.put("/api/products/{product_id}/reorder", response_model=ReorderRuleResponse)
def update_product_reorder_rule(
    product_id: int,
    req: ReorderRuleUpdate,
    db: Session = Depends(get_db),
    user=Depends(require_manager)
):
    prod = db.query(Product).filter(Product.id == product_id).first()
    if not prod:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Product not found")
        
    prod.reorder_level = req.reorder_level
    prod.reorder_qty = req.reorder_qty
    db.commit()
    db.refresh(prod)
    
    total_stock = db.query(func.coalesce(func.sum(StockQuant.quantity), 0.0)).filter(
        StockQuant.product_id == prod.id
    ).scalar() or 0.0
    
    is_below = (float(total_stock) <= prod.reorder_level and prod.reorder_level > 0) or (float(total_stock) <= 0)
    
    return ReorderRuleResponse(
        product_id=prod.id,
        product_name=prod.name,
        sku=prod.sku,
        unit_of_measure=prod.unit_of_measure,
        current_stock=float(total_stock),
        reorder_level=prod.reorder_level,
        reorder_qty=prod.reorder_qty,
        is_below_threshold=is_below
    )
