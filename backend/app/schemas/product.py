from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel

# Category schemas
class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

class CategoryResponse(CategoryBase):
    id: int
    product_count: Optional[int] = 0

    class Config:
        from_attributes = True

# Product schemas
class ProductBase(BaseModel):
    name: str
    sku: str
    category_id: Optional[int] = None
    unit_of_measure: str = "units"
    reorder_level: float = 0.0
    reorder_qty: float = 0.0

class ProductCreate(ProductBase):
    initial_stock: Optional[float] = 0.0
    initial_location_id: Optional[int] = None

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    sku: Optional[str] = None
    category_id: Optional[int] = None
    unit_of_measure: Optional[str] = None
    reorder_level: Optional[float] = None
    reorder_qty: Optional[float] = None

class LocationStockItem(BaseModel):
    location_id: int
    location_name: str
    location_code: str
    warehouse_id: Optional[int] = None
    warehouse_name: Optional[str] = None
    quantity: float
    last_updated: Optional[datetime] = None

    class Config:
        from_attributes = True

class ProductResponse(ProductBase):
    id: int
    category_name: Optional[str] = None
    total_stock: float = 0.0
    is_low_stock: bool = False
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ProductDetailResponse(ProductResponse):
    location_stocks: List[LocationStockItem] = []
