from typing import Optional, List
from pydantic import BaseModel

class LocationBase(BaseModel):
    name: str
    code: str
    type: str = "internal"  # "internal" | "vendor" | "customer"

class LocationCreate(LocationBase):
    warehouse_id: int

class LocationUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    type: Optional[str] = None

class LocationResponse(LocationBase):
    id: int
    warehouse_id: int
    warehouse_name: Optional[str] = None

    class Config:
        from_attributes = True

class WarehouseBase(BaseModel):
    name: str
    code: str
    address: Optional[str] = None
    is_active: bool = True

class WarehouseCreate(WarehouseBase):
    pass

class WarehouseUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    address: Optional[str] = None
    is_active: Optional[bool] = None

class WarehouseResponse(WarehouseBase):
    id: int
    location_count: int = 0
    locations: Optional[List[LocationResponse]] = None

    class Config:
        from_attributes = True

class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    current_password: Optional[str] = None
    new_password: Optional[str] = None
