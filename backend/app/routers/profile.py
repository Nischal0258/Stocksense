from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.auth import UserResponse
from app.schemas.warehouse import ProfileUpdate
from app.utils.dependencies import get_current_user
from app.utils.security import hash_password, verify_password

router = APIRouter(prefix="/api/profile", tags=["User Profile"])

@router.get("", response_model=UserResponse)
def get_user_profile(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("", response_model=UserResponse)
def update_user_profile(
    req: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if req.email is not None:
        clean_email = req.email.strip().lower()
        existing = db.query(User).filter(User.email == clean_email, User.id != current_user.id).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email is already used by another account")
        current_user.email = clean_email

    if req.name is not None:
        current_user.name = req.name.strip()

    if req.new_password is not None:
        if not req.current_password or not verify_password(req.current_password, current_user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is required and must match to set a new password"
            )
        current_user.password_hash = hash_password(req.new_password)

    db.commit()
    db.refresh(current_user)
    return current_user
