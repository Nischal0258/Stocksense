from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class SignupRequest(BaseModel):
    name: str
    email: str
    password: str
    role: Optional[str] = "inventory_manager"

class LoginRequest(BaseModel):
    email: str
    password: str

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    email: str
    otp: str
    new_password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class AuthResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    token: str
    token_type: str = "bearer"

class LoginResponse(BaseModel):
    token: str
    token_type: str = "bearer"
    user: UserResponse

class MessageResponse(BaseModel):
    message: str
    detail: Optional[str] = None
