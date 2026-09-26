from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, func

from app.database import get_db
from app.models.product import Product, Category
from app.models.stock import StockQuant, StockLedger
from app.models.warehouse import Location, Warehouse
from app.schemas.product import (
    ProductCreate,
    ProductUpdate,
    ProductResponse,
    ProductDetailResponse,
    LocationStockItem
)
from app.schemas.auth import MessageResponse
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/api/products", tags=["Products"])

def compute_product_response(product: Product, db: Session) -> ProductResponse:
    total_stock = db.query(func.coalesce(func.sum(StockQuant.quantity), 0.0)).filter(
        StockQuant.product_id == product.id
    ).scalar() or 0.0

    category_name = product.category.name if product.category else None
    is_low_stock = (total_stock <= product.reorder_level and product.reorder_level > 0) or (total_stock <= 0)

    return ProductResponse(
        id=product.id,
        name=product.name,
        sku=product.sku,
        category_id=product.category_id,
        category_name=category_name,
        unit_of_measure=product.unit_of_measure,
        reorder_level=product.reorder_level,
        reorder_qty=product.reorder_qty,
        total_stock=float(total_stock),
        is_low_stock=is_low_stock,
        created_at=product.created_at
    )

@router.get("", response_model=List[ProductResponse])
def get_products(
    search: Optional[str] = Query(None, description="Search by product name or SKU"),
    category_id: Optional[int] = Query(None, description="Filter by category ID"),
    low_stock_only: Optional[bool] = Query(False, description="Filter products below reorder level"),
    db: Session = Depends(get_db)
):
    query = db.query(Product)
    
    if search:
        search_pattern = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Product.name.ilike(search_pattern),
                Product.sku.ilike(search_pattern)
            )
        )
        
    if category_id:
        query = query.filter(Product.category_id == category_id)
        
    products = query.order_by(Product.name.asc()).all()
    
    results = []
    for prod in products:
        p_resp = compute_product_response(prod, db)
        if low_stock_only and not p_resp.is_low_stock:
            continue
        results.append(p_resp)
        
    return results

@router.post("", response_model=ProductDetailResponse, status_code=status.HTTP_201_CREATED)
def create_product(
    req: ProductCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    # Check SKU uniqueness
    existing_sku = db.query(Product).filter(Product.sku.ilike(req.sku.strip())).first()
    if existing_sku:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Product with SKU '{req.sku}' already exists"
        )
        
    if req.category_id:
        cat = db.query(Category).filter(Category.id == req.category_id).first()
        if not cat:
            raise HTTPException(status_code=400, detail="Specified category does not exist")
            
    product = Product(
        name=req.name.strip(),
        sku=req.sku.strip().upper(),
        category_id=req.category_id,
        unit_of_measure=req.unit_of_measure.strip() if req.unit_of_measure else "units",
        reorder_level=req.reorder_level or 0.0,
        reorder_qty=req.reorder_qty or 0.0
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    
    # Handle initial stock if specified
    if req.initial_stock and req.initial_stock > 0:
        target_location_id = req.initial_location_id
        if not target_location_id:
            # Fall back to first internal location available
            default_loc = db.query(Location).filter(Location.type == "internal").first()
            if default_loc:
                target_location_id = default_loc.id
                
        if target_location_id:
            loc = db.query(Location).filter(Location.id == target_location_id).first()
            if loc:
                quant = StockQuant(
                    product_id=product.id,
                    location_id=target_location_id,
                    quantity=req.initial_stock,
                    last_updated=datetime.now(timezone.utc)
                )
                db.add(quant)
                
                # Audit ledger entry
                ledger = StockLedger(
                    product_id=product.id,
                    location_id=target_location_id,
                    operation_id=None,
                    move_type="adjustment",
                    qty_change=req.initial_stock,
                    qty_after=req.initial_stock,
                    timestamp=datetime.now(timezone.utc),
                    remarks="Initial stock balance upon creation"
                )
                db.add(ledger)
                db.commit()

    base_resp = compute_product_response(product, db)
    stocks = get_product_stock_locations(product.id, db)
    return ProductDetailResponse(**base_resp.model_dump(), location_stocks=stocks)

def get_product_stock_locations(product_id: int, db: Session) -> List[LocationStockItem]:
    quants = db.query(StockQuant).filter(StockQuant.product_id == product_id).all()
    results = []
    for q in quants:
        loc = q.location
        wh = loc.warehouse if loc else None
        results.append(LocationStockItem(
            location_id=q.location_id,
            location_name=loc.name if loc else "Unknown",
            location_code=loc.code if loc else "",
            warehouse_id=wh.id if wh else None,
            warehouse_name=wh.name if wh else "N/A",
            quantity=q.quantity,
            last_updated=q.last_updated
        ))
    return results

@router.get("/{product_id}", response_model=ProductDetailResponse)
def get_product_detail(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    base_resp = compute_product_response(product, db)
    stocks = get_product_stock_locations(product.id, db)
    return ProductDetailResponse(**base_resp.model_dump(), location_stocks=stocks)

@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int,
    req: ProductUpdate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    if req.sku is not None:
        clean_sku = req.sku.strip().upper()
        existing = db.query(Product).filter(Product.sku.ilike(clean_sku), Product.id != product_id).first()
        if existing:
            raise HTTPException(status_code=400, detail=f"Another product with SKU '{clean_sku}' already exists")
        product.sku = clean_sku
        
    if req.name is not None:
        product.name = req.name.strip()
    if req.category_id is not None:
        product.category_id = req.category_id
    if req.unit_of_measure is not None:
        product.unit_of_measure = req.unit_of_measure.strip()
    if req.reorder_level is not None:
        product.reorder_level = req.reorder_level
    if req.reorder_qty is not None:
        product.reorder_qty = req.reorder_qty
        
    db.commit()
    db.refresh(product)
    return compute_product_response(product, db)

@router.delete("/{product_id}", response_model=MessageResponse)
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    # Check if used in operations
    has_moves = db.query(StockLedger).filter(StockLedger.product_id == product_id).first()
    if has_moves:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete product with existing stock movements/history"
        )
        
    db.delete(product)
    db.commit()
    return MessageResponse(message=f"Product '{product.name}' deleted successfully")

@router.get("/{product_id}/stock", response_model=List[LocationStockItem])
def get_product_stock_per_location(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return get_product_stock_locations(product_id, db)
