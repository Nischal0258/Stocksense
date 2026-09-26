from typing import Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.product import Product
from app.models.stock import StockQuant, StockOperation, StockMoveLine
from app.models.warehouse import Location, Warehouse

def get_dashboard_kpis(db: Session) -> Dict[str, Any]:
    # 1. Total products
    total_products = db.query(func.count(Product.id)).scalar() or 0

    # 2. Stock levels per product
    product_stocks = db.query(
        Product.id,
        Product.name,
        Product.sku,
        Product.reorder_level,
        func.coalesce(func.sum(StockQuant.quantity), 0.0).label("total_stock")
    ).outerjoin(StockQuant, Product.id == StockQuant.product_id)\
     .group_by(Product.id)\
     .all()

    low_stock_count = 0
    out_of_stock_count = 0
    low_stock_items = []

    for item in product_stocks:
        stock = float(item.total_stock)
        reorder_lvl = float(item.reorder_level)
        
        if stock <= 0:
            out_of_stock_count += 1
            low_stock_items.append({
                "product_id": item.id,
                "name": item.name,
                "sku": item.sku,
                "current_stock": stock,
                "reorder_level": reorder_lvl,
                "status": "out_of_stock"
            })
        elif reorder_lvl > 0 and stock <= reorder_lvl:
            low_stock_count += 1
            low_stock_items.append({
                "product_id": item.id,
                "name": item.name,
                "sku": item.sku,
                "current_stock": stock,
                "reorder_level": reorder_lvl,
                "status": "low_stock"
            })

    # 3. Pending Receipts
    pending_receipts = db.query(func.count(StockOperation.id)).filter(
        StockOperation.type == "receipt",
        StockOperation.status.in_(["draft", "waiting", "ready"])
    ).scalar() or 0

    # 4. Pending Deliveries
    pending_deliveries = db.query(func.count(StockOperation.id)).filter(
        StockOperation.type == "delivery",
        StockOperation.status.in_(["draft", "waiting", "ready"])
    ).scalar() or 0

    # 5. Scheduled / Pending Internal Transfers
    scheduled_transfers = db.query(func.count(StockOperation.id)).filter(
        StockOperation.type == "internal",
        StockOperation.status.in_(["draft", "waiting", "ready"])
    ).scalar() or 0

    return {
        "total_products": total_products,
        "low_stock_count": low_stock_count,
        "out_of_stock_count": out_of_stock_count,
        "pending_receipts": pending_receipts,
        "pending_deliveries": pending_deliveries,
        "scheduled_transfers": scheduled_transfers,
        "low_stock_items": low_stock_items
    }
