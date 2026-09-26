from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, UniqueConstraint
from sqlalchemy.orm import relationship
from app.database import Base

class StockQuant(Base):
    __tablename__ = "stock_quants"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    location_id = Column(Integer, ForeignKey("locations.id", ondelete="CASCADE"), nullable=False, index=True)
    quantity = Column(Float, default=0.0, nullable=False)
    last_updated = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    __table_args__ = (
        UniqueConstraint("product_id", "location_id", name="uq_product_location"),
    )

    # Relationships
    product = relationship("Product", back_populates="quants")
    location = relationship("Location", back_populates="quants")


class StockOperation(Base):
    __tablename__ = "stock_operations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    reference = Column(String(50), unique=True, index=True, nullable=False)  # e.g., REC-00001, DEL-00001
    type = Column(String(50), index=True, nullable=False)  # "receipt" | "delivery" | "internal" | "adjustment"
    status = Column(String(50), default="draft", index=True, nullable=False)  # "draft" | "waiting" | "ready" | "done" | "cancelled"
    source_location_id = Column(Integer, ForeignKey("locations.id", ondelete="SET NULL"), nullable=True)
    dest_location_id = Column(Integer, ForeignKey("locations.id", ondelete="SET NULL"), nullable=True)
    supplier_name = Column(String(200), nullable=True)  # for receipts
    notes = Column(Text, nullable=True)
    created_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    scheduled_date = Column(DateTime, nullable=True)
    done_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    creator = relationship("User", back_populates="operations")
    source_location = relationship("Location", foreign_keys=[source_location_id], back_populates="source_operations")
    dest_location = relationship("Location", foreign_keys=[dest_location_id], back_populates="dest_operations")
    move_lines = relationship("StockMoveLine", back_populates="operation", cascade="all, delete-orphan")
    ledger_entries = relationship("StockLedger", back_populates="operation")


class StockMoveLine(Base):
    __tablename__ = "stock_move_lines"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    operation_id = Column(Integer, ForeignKey("stock_operations.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    demand_qty = Column(Float, nullable=False, default=0.0)
    done_qty = Column(Float, nullable=False, default=0.0)

    # Relationships
    operation = relationship("StockOperation", back_populates="move_lines")
    product = relationship("Product", back_populates="move_lines")


class StockLedger(Base):
    __tablename__ = "stock_ledger"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    location_id = Column(Integer, ForeignKey("locations.id", ondelete="CASCADE"), nullable=False, index=True)
    operation_id = Column(Integer, ForeignKey("stock_operations.id", ondelete="SET NULL"), nullable=True, index=True)
    move_type = Column(String(50), nullable=False)  # "receipt" | "delivery" | "transfer_in" | "transfer_out" | "adjustment"
    qty_change = Column(Float, nullable=False)
    qty_after = Column(Float, nullable=False)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    remarks = Column(Text, nullable=True)

    # Relationships
    product = relationship("Product", back_populates="ledger_entries")
    location = relationship("Location", back_populates="ledger_entries")
    operation = relationship("StockOperation", back_populates="ledger_entries")
