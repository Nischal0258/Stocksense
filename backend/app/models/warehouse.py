from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

class Warehouse(Base):
    __tablename__ = "warehouses"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    code = Column(String(50), unique=True, index=True, nullable=False)
    address = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)

    # Relationships
    locations = relationship("Location", back_populates="warehouse", cascade="all, delete-orphan")


class Location(Base):
    __tablename__ = "locations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(100), nullable=False)
    code = Column(String(50), index=True, nullable=False)
    type = Column(String(50), default="internal", nullable=False)  # "internal" | "vendor" | "customer"

    # Relationships
    warehouse = relationship("Warehouse", back_populates="locations")
    quants = relationship("StockQuant", back_populates="location", cascade="all, delete-orphan")
    source_operations = relationship("StockOperation", foreign_keys="[StockOperation.source_location_id]", back_populates="source_location")
    dest_operations = relationship("StockOperation", foreign_keys="[StockOperation.dest_location_id]", back_populates="dest_location")
    ledger_entries = relationship("StockLedger", back_populates="location")
