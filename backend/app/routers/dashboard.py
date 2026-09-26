from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.database import get_db
from app.models.stock import StockOperation, StockMoveLine
from app.models.product import Product
from app.models.warehouse import Location
from app.schemas.stock import StockOperationResponse
from app.services.stock_service import build_operation_response
from app.services.alert_service import get_dashboard_kpis

router = APIRouter(tags=["Dashboard & Operations"])

@router.get("/api/dashboard/kpis")
def get_kpis_endpoint(db: Session = Depends(get_db)) -> Dict[str, Any]:
    return get_dashboard_kpis(db)

@router.get("/api/operations", response_model=List[StockOperationResponse])
def get_operations(
    type: Optional[str] = Query(None, description="Filter by type: receipt, delivery, internal, adjustment"),
    status: Optional[str] = Query(None, description="Filter by status: draft, waiting, ready, done, cancelled"),
    warehouse_id: Optional[int] = Query(None, description="Filter by warehouse ID"),
    location_id: Optional[int] = Query(None, description="Filter by location ID (source or dest)"),
    category_id: Optional[int] = Query(None, description="Filter by product category"),
    search: Optional[str] = Query(None, description="Search by reference or supplier"),
    db: Session = Depends(get_db)
):
    query = db.query(StockOperation)

    if type:
        query = query.filter(StockOperation.type == type.lower())
    if status:
        query = query.filter(StockOperation.status == status.lower())

    if search:
        term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                StockOperation.reference.ilike(term),
                StockOperation.supplier_name.ilike(term)
            )
        )

    if location_id:
        query = query.filter(
            or_(
                StockOperation.source_location_id == location_id,
                StockOperation.dest_location_id == location_id
            )
        )

    if warehouse_id:
        wh_loc_ids = [l.id for l in db.query(Location.id).filter(Location.warehouse_id == warehouse_id).all()]
        query = query.filter(
            or_(
                StockOperation.source_location_id.in_(wh_loc_ids),
                StockOperation.dest_location_id.in_(wh_loc_ids)
            )
        )

    if category_id:
        matching_op_ids = db.query(StockMoveLine.operation_id)\
            .join(Product, StockMoveLine.product_id == Product.id)\
            .filter(Product.category_id == category_id)\
            .distinct()\
            .all()
        op_id_list = [op_id for (op_id,) in matching_op_ids]
        query = query.filter(StockOperation.id.in_(op_id_list))

    ops = query.order_by(StockOperation.created_at.desc()).all()
    return [build_operation_response(op, include_lines=True) for op in ops]
