from pydantic import BaseModel
from typing import Optional


class ShopSettingsResponse(BaseModel):
    id: int
    shop_name: str
    about_description: str
    phone_number: str
    email: str
    address: str
    working_hours: str
    logo_url: str
    founder_name: str
    founder_description: str
    founder_photo_url: str
    footer_text: str
    updated_at: Optional[str] = None


class ShopSettingsUpdate(BaseModel):
    shop_name: Optional[str] = None
    about_description: Optional[str] = None
    phone_number: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    working_hours: Optional[str] = None
    logo_url: Optional[str] = None
    founder_name: Optional[str] = None
    founder_description: Optional[str] = None
    founder_photo_url: Optional[str] = None
    footer_text: Optional[str] = None
