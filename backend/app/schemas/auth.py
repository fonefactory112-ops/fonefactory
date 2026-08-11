from pydantic import BaseModel
from typing import Optional


class AdminVerifyResponse(BaseModel):
    id: str
    email: str
    full_name: str
    approval_status: str


class AdminProfileUpdate(BaseModel):
    full_name: Optional[str] = None
