from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models.product import Category, Product
from app.schemas.product import CategoryCreate, CategoryUpdate, CategoryResponse
from app.schemas.auth import MessageResponse
from app.utils.dependencies import get_current_user, require_manager

router = APIRouter(prefix="/api/categories", tags=["Categories"])

@router.get("", response_model=List[CategoryResponse])
def get_categories(db: Session = Depends(get_db)):
    categories = db.query(Category).all()
    result = []
    for cat in categories:
        count = db.query(func.count(Product.id)).filter(Product.category_id == cat.id).scalar() or 0
        result.append(CategoryResponse(
            id=cat.id,
            name=cat.name,
            description=cat.description,
            product_count=count
        ))
    return result

@router.post("", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(
    req: CategoryCreate,
    db: Session = Depends(get_db),
    user=Depends(require_manager)
):
    existing = db.query(Category).filter(Category.name.ilike(req.name.strip())).first()
    if existing:
        raise HTTPException(status_code=400, detail="Category with this name already exists")
    
    cat = Category(name=req.name.strip(), description=req.description)
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return CategoryResponse(id=cat.id, name=cat.name, description=cat.description, product_count=0)

@router.get("/{category_id}", response_model=CategoryResponse)
def get_category(category_id: int, db: Session = Depends(get_db)):
    cat = db.query(Category).filter(Category.id == category_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    count = db.query(func.count(Product.id)).filter(Product.category_id == cat.id).scalar() or 0
    return CategoryResponse(id=cat.id, name=cat.name, description=cat.description, product_count=count)

@router.put("/{category_id}", response_model=CategoryResponse)
def update_category(
    category_id: int,
    req: CategoryUpdate,
    db: Session = Depends(get_db),
    user=Depends(require_manager)
):
    cat = db.query(Category).filter(Category.id == category_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    
    if req.name is not None:
        name_clean = req.name.strip()
        existing = db.query(Category).filter(Category.name.ilike(name_clean), Category.id != category_id).first()
        if existing:
            raise HTTPException(status_code=400, detail="Another category with this name already exists")
        cat.name = name_clean
        
    if req.description is not None:
        cat.description = req.description
        
    db.commit()
    db.refresh(cat)
    count = db.query(func.count(Product.id)).filter(Product.category_id == cat.id).scalar() or 0
    return CategoryResponse(id=cat.id, name=cat.name, description=cat.description, product_count=count)

@router.delete("/{category_id}", response_model=MessageResponse)
def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    user=Depends(require_manager)
):
    cat = db.query(Category).filter(Category.id == category_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    
    # Nullify category on products
    db.query(Product).filter(Product.category_id == category_id).update({"category_id": None})
    db.delete(cat)
    db.commit()
    return MessageResponse(message=f"Category '{cat.name}' deleted successfully")
