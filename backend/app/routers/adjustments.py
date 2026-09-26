from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.stock import StockOperation
from app.schemas.stock import (
    AdjustmentCreate,
    StockOperationResponse
)
from app.services.stock_service import (
    create_adjustment,
    validate_adjustment,
    build_operation_response
)
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/api/adjustments", tags=["Stock Adjustments"])

@router.get("", response_model=List[StockOperationResponse])
def get_adjustments(
    status: Optional[str] = Query(None, description="Filter by status: draft, done, cancelled"),
    db: Session = Depends(get_db)
):
    query = db.query(StockOperation).filter(StockOperation.type == "adjustment")
    if status:
        query = query.filter(StockOperation.status == status.lower())
    ops = query.order_by(StockOperation.created_at.desc()).all()
    return [build_operation_response(op, include_lines=True) for op in ops]

@router.post("", response_model=StockOperationResponse, status_code=status.HTTP_201_CREATED)
def create_new_adjustment(
    req: AdjustmentCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    op = create_adjustment(db, req, user_id=user.id)
    return build_operation_response(op, include_lines=True)

@router.get("/{operation_id}", response_model=StockOperationResponse)
def get_adjustment_detail(operation_id: int, db: Session = Depends(get_db)):
    op = db.query(StockOperation).filter(
        StockOperation.id == operation_id,
        StockOperation.type == "adjustment"
    ).first()
    if not op:
        raise HTTPException(status_code=404, detail="Adjustment not found")
    return build_operation_response(op, include_lines=True)

@router.post("/{operation_id}/validate", response_model=StockOperationResponse)
def validate_adjustment_endpoint(
    operation_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    op = validate_adjustment(db, operation_id)
    return build_operation_response(op, include_lines=True)
