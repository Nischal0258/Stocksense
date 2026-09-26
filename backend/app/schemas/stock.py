from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel

class MoveLineCreate(BaseModel):
    product_id: int
    demand_qty: float
    done_qty: Optional[float] = 0.0

class MoveLineUpdateItem(BaseModel):
    id: int
    done_qty: float

class MoveLineResponse(BaseModel):
    id: int
    operation_id: int
    product_id: int
    product_name: str
    product_sku: str
    product_uom: str
    demand_qty: float
    done_qty: float

    class Config:
        from_attributes = True

class ValidateRequest(BaseModel):
    lines: Optional[List[MoveLineUpdateItem]] = None

class ReceiptCreate(BaseModel):
    supplier_name: Optional[str] = None
    dest_location_id: int
    scheduled_date: Optional[datetime] = None
    notes: Optional[str] = None
    lines: List[MoveLineCreate]

class DeliveryCreate(BaseModel):
    source_location_id: int
    scheduled_date: Optional[datetime] = None
    notes: Optional[str] = None
    lines: List[MoveLineCreate]

class TransferCreate(BaseModel):
    source_location_id: int
    dest_location_id: int
    scheduled_date: Optional[datetime] = None
    notes: Optional[str] = None
    lines: List[MoveLineCreate]

class AdjustmentLineCreate(BaseModel):
    product_id: int
    counted_qty: float

class AdjustmentCreate(BaseModel):
    location_id: int
    notes: Optional[str] = None
    lines: List[AdjustmentLineCreate]

class StockOperationResponse(BaseModel):
    id: int
    reference: str
    type: str  # receipt | delivery | internal | adjustment
    status: str  # draft | waiting | ready | done | cancelled
    source_location_id: Optional[int] = None
    source_location_name: Optional[str] = None
    dest_location_id: Optional[int] = None
    dest_location_name: Optional[str] = None
    supplier_name: Optional[str] = None
    notes: Optional[str] = None
    created_by: Optional[int] = None
    creator_name: Optional[str] = None
    scheduled_date: Optional[datetime] = None
    done_date: Optional[datetime] = None
    created_at: Optional[datetime] = None
    line_count: int = 0
    lines: Optional[List[MoveLineResponse]] = None

    class Config:
        from_attributes = True

class StockLedgerResponse(BaseModel):
    id: int
    product_id: int
    product_name: str
    product_sku: str
    product_uom: str
    location_id: int
    location_name: str
    warehouse_name: Optional[str] = None
    operation_id: Optional[int] = None
    operation_reference: Optional[str] = None
    move_type: str
    qty_change: float
    qty_after: float
    timestamp: datetime
    remarks: Optional[str] = None

    class Config:
        from_attributes = True

class ReorderRuleResponse(BaseModel):
    product_id: int
    product_name: str
    sku: str
    unit_of_measure: str
    current_stock: float
    reorder_level: float
    reorder_qty: float
    is_below_threshold: bool

class ReorderRuleUpdate(BaseModel):
    reorder_level: float
    reorder_qty: float
