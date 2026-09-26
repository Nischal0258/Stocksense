from datetime import datetime, timezone
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.auth import (
    SignupRequest,
    LoginRequest,
    ResetPasswordRequest,
    AuthResponse,
    LoginResponse,
    UserResponse,
    MessageResponse
)
from app.utils.security import hash_password, verify_password, create_access_token
from app.utils.otp import generate_otp, get_otp_expiry, is_otp_valid

def register_user(db: Session, req: SignupRequest) -> AuthResponse:
    existing_user = db.query(User).filter(User.email == req.email.lower()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    new_user = User(
        name=req.name.strip(),
        email=req.email.lower().strip(),
        password_hash=hash_password(req.password),
        role=req.role if req.role in ["inventory_manager", "warehouse_staff"] else "inventory_manager"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token(data={"sub": str(new_user.id), "email": new_user.email, "role": new_user.role})

    return AuthResponse(
        id=new_user.id,
        name=new_user.name,
        email=new_user.email,
        role=new_user.role,
        token=token
    )

def authenticate_user(db: Session, req: LoginRequest) -> LoginResponse:
    user = db.query(User).filter(User.email == req.email.lower().strip()).first()
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    token = create_access_token(data={"sub": str(user.id), "email": user.email, "role": user.role})
    
    return LoginResponse(
        token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )

def request_password_reset(db: Session, email: str) -> MessageResponse:
    user = db.query(User).filter(User.email == email.lower().strip()).first()
    if not user:
        # Avoid user enumeration in production, but for hackathon show clean message
        return MessageResponse(
            message="If this email is registered, a password reset OTP has been sent."
        )
    
    otp = generate_otp(6)
    user.otp = otp
    user.otp_expiry = get_otp_expiry(15)  # 15 minutes validity
    db.commit()

    print(f"\n[SECURITY ALERT / DEMO] Password reset OTP for {user.email}: {otp}\n")

    return MessageResponse(
        message="Password reset OTP has been generated successfully.",
        detail=f"For hackathon evaluation: OTP is {otp}"
    )

def reset_password_with_otp(db: Session, req: ResetPasswordRequest) -> MessageResponse:
    user = db.query(User).filter(User.email == req.email.lower().strip()).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if not is_otp_valid(user.otp, req.otp.strip(), user.otp_expiry):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OTP code"
        )
    
    user.password_hash = hash_password(req.new_password)
    user.otp = None
    user.otp_expiry = None
    db.commit()

    return MessageResponse(message="Password has been reset successfully. You can now log in.")
