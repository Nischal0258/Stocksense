import random
import string
from datetime import datetime, timedelta, timezone
from typing import Optional

def generate_otp(length: int = 6) -> str:
    """Generates a random numeric OTP."""
    return "".join(random.choices(string.digits, k=length))

def get_otp_expiry(minutes: int = 10) -> datetime:
    """Returns an expiry timestamp in UTC."""
    return datetime.now(timezone.utc) + timedelta(minutes=minutes)

def is_otp_valid(stored_otp: Optional[str], entered_otp: str, expiry: Optional[datetime]) -> bool:
    """Validates if entered OTP matches stored OTP and is not expired."""
    if not stored_otp or not expiry:
        return False
    
    if stored_otp != entered_otp:
        return False
        
    current_time = datetime.now(timezone.utc)
    # Handle timezone-aware vs naive datetimes
    if expiry.tzinfo is None:
        expiry = expiry.replace(tzinfo=timezone.utc)
        
    return current_time <= expiry
