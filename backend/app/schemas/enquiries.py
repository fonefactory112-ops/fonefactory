from pydantic import BaseModel
from typing import Optional


class EnquiryCreate(BaseModel):
    type: str  # 'service' or 'accessory'
    reference_id: str
    reference_name: str
    category_name: str
    customer_name: str
    customer_phone: str


class EnquiryStatusUpdate(BaseModel):
    enquiry_status: str  # 'new', 'contacted', 'completed', 'cancelled'
