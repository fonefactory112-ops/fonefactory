from pydantic import BaseModel
from typing import Optional


class OTPSendRequest(BaseModel):
    phone: str


class OTPVerifyRequest(BaseModel):
    phone: str
    otp_code: str


class EnquiryCreate(BaseModel):
    type: str  # 'service' or 'accessory'
    reference_id: str
    reference_name: str
    category_name: str
    customer_phone: str


class EnquiryStatusUpdate(BaseModel):
    enquiry_status: str  # 'new', 'contacted', 'completed', 'cancelled'
