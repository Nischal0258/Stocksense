from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.stock import StockOperation
from app.schemas.stock import (
    TransferCreate,
    ValidateRequest,
    StockOperationResponse
)
from app.services.stock_service import (
    create_transfer,
    validate_transfer,
    build_operation_response
)
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/api/transfers", tags=["Internal Transfers"])

@router.get("", response_model=List[StockOperationResponse])
def get_transfers(
    status: Optional[str] = Query(None, description="Filter by status: draft, ready, done, cancelled"),
    db: Session = Depends(get_db)
):
    query = db.query(StockOperation).filter(StockOperation.type == "internal")
    if status:
        query = query.filter(StockOperation.status == status.lower())
    ops = query.order_by(StockOperation.created_at.desc()).all()
    return [build_operation_response(op, include_lines=True) for op in ops]

@router.post("", response_model=StockOperationResponse, status_code=status.HTTP_201_CREATED)
def create_new_transfer(
    req: TransferCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    op = create_transfer(db, req, user_id=user.id)
    return build_operation_response(op, include_lines=True)

@router.get("/{operation_id}", response_model=StockOperationResponse)
def get_transfer_detail(operation_id: int, db: Session = Depends(get_db)):
    op = db.query(StockOperation).filter(
        StockOperation.id == operation_id,
        StockOperation.type == "internal"
    ).first()
    if not op:
        raise HTTPException(status_code=404, detail="Internal transfer not found")
    return build_operation_response(op, include_lines=True)

@router.post("/{operation_id}/validate", response_model=StockOperationResponse)
def validate_transfer_endpoint(
    operation_id: int,
    req: Optional[ValidateRequest] = None,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    lines = req.lines if req else None
    op = validate_transfer(db, operation_id, lines_data=lines)
    return build_operation_response(op, include_lines=True)
