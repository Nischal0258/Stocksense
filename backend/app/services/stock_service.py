from datetime import datetime, timezone
from typing import Optional, List, Dict
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.stock import StockQuant, StockOperation, StockMoveLine, StockLedger
from app.models.product import Product
from app.models.warehouse import Location
from app.schemas.stock import (
    MoveLineUpdateItem,
    StockOperationResponse,
    MoveLineResponse,
    ReceiptCreate,
    DeliveryCreate,
    TransferCreate,
    AdjustmentCreate
)

def generate_reference(db: Session, op_type: str) -> str:
    prefix_map = {
        "receipt": "REC",
        "delivery": "DEL",
        "internal": "TRF",
        "adjustment": "ADJ"
    }
    prefix = prefix_map.get(op_type, "OP")
    
    count = db.query(func.count(StockOperation.id)).filter(StockOperation.type == op_type).scalar() or 0
    ref_num = count + 1
    
    # Ensure reference uniqueness in case of deletions
    while True:
        candidate = f"{prefix}-{ref_num:05d}"
        exists = db.query(StockOperation).filter(StockOperation.reference == candidate).first()
        if not exists:
            return candidate
        ref_num += 1

def get_or_create_quant(db: Session, product_id: int, location_id: int) -> StockQuant:
    quant = db.query(StockQuant).filter(
        StockQuant.product_id == product_id,
        StockQuant.location_id == location_id
    ).first()
    if not quant:
        quant = StockQuant(
            product_id=product_id,
            location_id=location_id,
            quantity=0.0,
            last_updated=datetime.now(timezone.utc)
        )
        db.add(quant)
        db.flush()
    return quant

def create_ledger_entry(
    db: Session,
    product_id: int,
    location_id: int,
    operation_id: Optional[int],
    move_type: str,
    qty_change: float,
    qty_after: float,
    remarks: Optional[str] = None
) -> StockLedger:
    entry = StockLedger(
        product_id=product_id,
        location_id=location_id,
        operation_id=operation_id,
        move_type=move_type,
        qty_change=qty_change,
        qty_after=qty_after,
        timestamp=datetime.now(timezone.utc),
        remarks=remarks
    )
    db.add(entry)
    db.flush()
    return entry

def build_operation_response(operation: StockOperation, include_lines: bool = True) -> StockOperationResponse:
    lines_resp = None
    if include_lines and operation.move_lines:
        lines_resp = []
        for line in operation.move_lines:
            prod = line.product
            lines_resp.append(MoveLineResponse(
                id=line.id,
                operation_id=line.operation_id,
                product_id=line.product_id,
                product_name=prod.name if prod else "Unknown",
                product_sku=prod.sku if prod else "",
                product_uom=prod.unit_of_measure if prod else "units",
                demand_qty=line.demand_qty,
                done_qty=line.done_qty
            ))

    return StockOperationResponse(
        id=operation.id,
        reference=operation.reference,
        type=operation.type,
        status=operation.status,
        source_location_id=operation.source_location_id,
        source_location_name=operation.source_location.name if operation.source_location else None,
        dest_location_id=operation.dest_location_id,
        dest_location_name=operation.dest_location.name if operation.dest_location else None,
        supplier_name=operation.supplier_name,
        notes=operation.notes,
        created_by=operation.created_by,
        creator_name=operation.creator.name if operation.creator else None,
        scheduled_date=operation.scheduled_date,
        done_date=operation.done_date,
        created_at=operation.created_at,
        line_count=len(operation.move_lines) if operation.move_lines else 0,
        lines=lines_resp
    )

# ----------------- RECEIPT LOGIC -----------------

def create_receipt(db: Session, req: ReceiptCreate, user_id: Optional[int]) -> StockOperation:
    dest_loc = db.query(Location).filter(Location.id == req.dest_location_id).first()
    if not dest_loc:
        raise HTTPException(status_code=400, detail="Destination location does not exist")
        
    ref = generate_reference(db, "receipt")
    operation = StockOperation(
        reference=ref,
        type="receipt",
        status="draft",
        dest_location_id=req.dest_location_id,
        supplier_name=req.supplier_name,
        notes=req.notes,
        scheduled_date=req.scheduled_date,
        created_by=user_id,
        created_at=datetime.now(timezone.utc)
    )
    db.add(operation)
    db.flush()

    for line_req in req.lines:
        prod = db.query(Product).filter(Product.id == line_req.product_id).first()
        if not prod:
            raise HTTPException(status_code=400, detail=f"Product ID {line_req.product_id} not found")
        move_line = StockMoveLine(
            operation_id=operation.id,
            product_id=line_req.product_id,
            demand_qty=line_req.demand_qty,
            done_qty=line_req.done_qty or line_req.demand_qty
        )
        db.add(move_line)

    db.commit()
    db.refresh(operation)
    return operation

def validate_receipt(
    db: Session,
    operation_id: int,
    lines_data: Optional[List[MoveLineUpdateItem]] = None
) -> StockOperation:
    operation = db.query(StockOperation).filter(
        StockOperation.id == operation_id,
        StockOperation.type == "receipt"
    ).first()
    
    if not operation:
        raise HTTPException(status_code=404, detail="Receipt not found")
    if operation.status == "done":
        raise HTTPException(status_code=400, detail="Receipt has already been validated and marked as done")
    if operation.status == "cancelled":
        raise HTTPException(status_code=400, detail="Cancelled receipt cannot be validated")

    # Update line done quantities if provided
    if lines_data:
        update_map = {item.id: item.done_qty for item in lines_data}
        for line in operation.move_lines:
            if line.id in update_map:
                line.done_qty = update_map[line.id]
    else:
        # Default done_qty to demand_qty if done_qty is 0
        for line in operation.move_lines:
            if line.done_qty == 0 and line.demand_qty > 0:
                line.done_qty = line.demand_qty

    # Increase stock and record in ledger
    for line in operation.move_lines:
        qty_to_add = line.done_qty
        quant = get_or_create_quant(db, line.product_id, operation.dest_location_id)
        quant.quantity += qty_to_add
        quant.last_updated = datetime.now(timezone.utc)
        
        create_ledger_entry(
            db=db,
            product_id=line.product_id,
            location_id=operation.dest_location_id,
            operation_id=operation.id,
            move_type="receipt",
            qty_change=qty_to_add,
            qty_after=quant.quantity,
            remarks=f"Receipt {operation.reference} from {operation.supplier_name or 'vendor'}"
        )

    operation.status = "done"
    operation.done_date = datetime.now(timezone.utc)
    db.commit()
    db.refresh(operation)
    return operation

# ----------------- DELIVERY LOGIC -----------------

def create_delivery(db: Session, req: DeliveryCreate, user_id: Optional[int]) -> StockOperation:
    src_loc = db.query(Location).filter(Location.id == req.source_location_id).first()
    if not src_loc:
        raise HTTPException(status_code=400, detail="Source location does not exist")
        
    ref = generate_reference(db, "delivery")
    operation = StockOperation(
        reference=ref,
        type="delivery",
        status="draft",
        source_location_id=req.source_location_id,
        notes=req.notes,
        scheduled_date=req.scheduled_date,
        created_by=user_id,
        created_at=datetime.now(timezone.utc)
    )
    db.add(operation)
    db.flush()

    for line_req in req.lines:
        prod = db.query(Product).filter(Product.id == line_req.product_id).first()
        if not prod:
            raise HTTPException(status_code=400, detail=f"Product ID {line_req.product_id} not found")
        move_line = StockMoveLine(
            operation_id=operation.id,
            product_id=line_req.product_id,
            demand_qty=line_req.demand_qty,
            done_qty=line_req.done_qty or line_req.demand_qty
        )
        db.add(move_line)

    db.commit()
    db.refresh(operation)
    return operation

def pick_delivery(db: Session, operation_id: int) -> StockOperation:
    op = db.query(StockOperation).filter(StockOperation.id == operation_id, StockOperation.type == "delivery").first()
    if not op:
        raise HTTPException(status_code=404, detail="Delivery order not found")
    if op.status != "draft":
        raise HTTPException(status_code=400, detail=f"Delivery is in '{op.status}' state, expected 'draft'")
    op.status = "waiting"
    db.commit()
    db.refresh(op)
    return op

def pack_delivery(db: Session, operation_id: int) -> StockOperation:
    op = db.query(StockOperation).filter(StockOperation.id == operation_id, StockOperation.type == "delivery").first()
    if not op:
        raise HTTPException(status_code=404, detail="Delivery order not found")
    if op.status != "waiting":
        raise HTTPException(status_code=400, detail=f"Delivery is in '{op.status}' state, expected 'waiting'")
    op.status = "ready"
    db.commit()
    db.refresh(op)
    return op

def validate_delivery(
    db: Session,
    operation_id: int,
    lines_data: Optional[List[MoveLineUpdateItem]] = None
) -> StockOperation:
    operation = db.query(StockOperation).filter(
        StockOperation.id == operation_id,
        StockOperation.type == "delivery"
    ).first()
    
    if not operation:
        raise HTTPException(status_code=404, detail="Delivery order not found")
    if operation.status == "done":
        raise HTTPException(status_code=400, detail="Delivery order has already been validated and shipped")
    if operation.status == "cancelled":
        raise HTTPException(status_code=400, detail="Cancelled delivery cannot be validated")

    # Update line done quantities if provided
    if lines_data:
        update_map = {item.id: item.done_qty for item in lines_data}
        for line in operation.move_lines:
            if line.id in update_map:
                line.done_qty = update_map[line.id]
    else:
        for line in operation.move_lines:
            if line.done_qty == 0 and line.demand_qty > 0:
                line.done_qty = line.demand_qty

    # Check stock availability for all lines before deducting
    for line in operation.move_lines:
        quant = db.query(StockQuant).filter(
            StockQuant.product_id == line.product_id,
            StockQuant.location_id == operation.source_location_id
        ).first()
        available_qty = quant.quantity if quant else 0.0
        
        if available_qty < line.done_qty:
            prod_name = line.product.name if line.product else f"Product #{line.product_id}"
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock for '{prod_name}'. Available: {available_qty}, Requested: {line.done_qty}"
            )

    # Deduct stock and record in ledger
    for line in operation.move_lines:
        quant = get_or_create_quant(db, line.product_id, operation.source_location_id)
        quant.quantity -= line.done_qty
        quant.last_updated = datetime.now(timezone.utc)

        create_ledger_entry(
            db=db,
            product_id=line.product_id,
            location_id=operation.source_location_id,
            operation_id=operation.id,
            move_type="delivery",
            qty_change=-line.done_qty,
            qty_after=quant.quantity,
            remarks=f"Delivery order {operation.reference} shipped"
        )

    operation.status = "done"
    operation.done_date = datetime.now(timezone.utc)
    db.commit()
    db.refresh(operation)
    return operation

# ----------------- INTERNAL TRANSFER LOGIC -----------------

def create_transfer(db: Session, req: TransferCreate, user_id: Optional[int]) -> StockOperation:
    if req.source_location_id == req.dest_location_id:
        raise HTTPException(status_code=400, detail="Source and destination locations cannot be the same")
        
    src_loc = db.query(Location).filter(Location.id == req.source_location_id).first()
    dst_loc = db.query(Location).filter(Location.id == req.dest_location_id).first()
    if not src_loc or not dst_loc:
        raise HTTPException(status_code=400, detail="Source or destination location not found")

    ref = generate_reference(db, "internal")
    operation = StockOperation(
        reference=ref,
        type="internal",
        status="draft",
        source_location_id=req.source_location_id,
        dest_location_id=req.dest_location_id,
        notes=req.notes,
        scheduled_date=req.scheduled_date,
        created_by=user_id,
        created_at=datetime.now(timezone.utc)
    )
    db.add(operation)
    db.flush()

    for line_req in req.lines:
        prod = db.query(Product).filter(Product.id == line_req.product_id).first()
        if not prod:
            raise HTTPException(status_code=400, detail=f"Product ID {line_req.product_id} not found")
        move_line = StockMoveLine(
            operation_id=operation.id,
            product_id=line_req.product_id,
            demand_qty=line_req.demand_qty,
            done_qty=line_req.done_qty or line_req.demand_qty
        )
        db.add(move_line)

    db.commit()
    db.refresh(operation)
    return operation

def validate_transfer(
    db: Session,
    operation_id: int,
    lines_data: Optional[List[MoveLineUpdateItem]] = None
) -> StockOperation:
    operation = db.query(StockOperation).filter(
        StockOperation.id == operation_id,
        StockOperation.type == "internal"
    ).first()
    
    if not operation:
        raise HTTPException(status_code=404, detail="Internal transfer not found")
    if operation.status == "done":
        raise HTTPException(status_code=400, detail="Transfer has already been completed")

    if lines_data:
        update_map = {item.id: item.done_qty for item in lines_data}
        for line in operation.move_lines:
            if line.id in update_map:
                line.done_qty = update_map[line.id]
    else:
        for line in operation.move_lines:
            if line.done_qty == 0 and line.demand_qty > 0:
                line.done_qty = line.demand_qty

    # Verify source availability
    for line in operation.move_lines:
        src_quant = db.query(StockQuant).filter(
            StockQuant.product_id == line.product_id,
            StockQuant.location_id == operation.source_location_id
        ).first()
        available = src_quant.quantity if src_quant else 0.0
        if available < line.done_qty:
            prod_name = line.product.name if line.product else f"Product #{line.product_id}"
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock for '{prod_name}' at source location. Available: {available}, Required: {line.done_qty}"
            )

    # Move stock: deduct source, add to dest, log both in ledger
    for line in operation.move_lines:
        src_quant = get_or_create_quant(db, line.product_id, operation.source_location_id)
        dst_quant = get_or_create_quant(db, line.product_id, operation.dest_location_id)
        
        src_quant.quantity -= line.done_qty
        src_quant.last_updated = datetime.now(timezone.utc)
        
        dst_quant.quantity += line.done_qty
        dst_quant.last_updated = datetime.now(timezone.utc)

        create_ledger_entry(
            db=db,
            product_id=line.product_id,
            location_id=operation.source_location_id,
            operation_id=operation.id,
            move_type="transfer_out",
            qty_change=-line.done_qty,
            qty_after=src_quant.quantity,
            remarks=f"Internal transfer {operation.reference} to {operation.dest_location.name}"
        )
        create_ledger_entry(
            db=db,
            product_id=line.product_id,
            location_id=operation.dest_location_id,
            operation_id=operation.id,
            move_type="transfer_in",
            qty_change=+line.done_qty,
            qty_after=dst_quant.quantity,
            remarks=f"Internal transfer {operation.reference} from {operation.source_location.name}"
        )

    operation.status = "done"
    operation.done_date = datetime.now(timezone.utc)
    db.commit()
    db.refresh(operation)
    return operation

# ----------------- STOCK ADJUSTMENT LOGIC -----------------

def create_adjustment(db: Session, req: AdjustmentCreate, user_id: Optional[int]) -> StockOperation:
    loc = db.query(Location).filter(Location.id == req.location_id).first()
    if not loc:
        raise HTTPException(status_code=400, detail="Location not found")

    ref = generate_reference(db, "adjustment")
    operation = StockOperation(
        reference=ref,
        type="adjustment",
        status="draft",
        dest_location_id=req.location_id,
        notes=req.notes,
        created_by=user_id,
        created_at=datetime.now(timezone.utc)
    )
    db.add(operation)
    db.flush()

    for line_req in req.lines:
        prod = db.query(Product).filter(Product.id == line_req.product_id).first()
        if not prod:
            raise HTTPException(status_code=400, detail=f"Product ID {line_req.product_id} not found")
        
        # recorded stock is placed in demand_qty, counted in done_qty
        quant = db.query(StockQuant).filter(
            StockQuant.product_id == line_req.product_id,
            StockQuant.location_id == req.location_id
        ).first()
        recorded_qty = quant.quantity if quant else 0.0

        move_line = StockMoveLine(
            operation_id=operation.id,
            product_id=line_req.product_id,
            demand_qty=recorded_qty,
            done_qty=line_req.counted_qty
        )
        db.add(move_line)

    db.commit()
    db.refresh(operation)
    return operation

def validate_adjustment(db: Session, operation_id: int) -> StockOperation:
    operation = db.query(StockOperation).filter(
        StockOperation.id == operation_id,
        StockOperation.type == "adjustment"
    ).first()
    
    if not operation:
        raise HTTPException(status_code=404, detail="Adjustment not found")
    if operation.status == "done":
        raise HTTPException(status_code=400, detail="Adjustment has already been validated")

    for line in operation.move_lines:
        quant = get_or_create_quant(db, line.product_id, operation.dest_location_id)
        recorded = quant.quantity
        counted = line.done_qty
        diff = counted - recorded
        
        quant.quantity = counted
        quant.last_updated = datetime.now(timezone.utc)

        create_ledger_entry(
            db=db,
            product_id=line.product_id,
            location_id=operation.dest_location_id,
            operation_id=operation.id,
            move_type="adjustment",
            qty_change=diff,
            qty_after=counted,
            remarks=f"Stock adjustment {operation.reference}: counted {counted}, recorded {recorded} (diff {diff:+.2f})"
        )

    operation.status = "done"
    operation.done_date = datetime.now(timezone.utc)
    db.commit()
    db.refresh(operation)
    return operation
