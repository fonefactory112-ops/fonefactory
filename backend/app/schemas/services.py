from pydantic import BaseModel
from typing import Optional


class ServiceCategoryCreate(BaseModel):
    name: str
    description: Optional[str] = ""
    display_order: Optional[int] = 0


class ServiceCategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    display_order: Optional[int] = None
    is_active: Optional[bool] = None


class ServiceCreate(BaseModel):
    category_id: str
    name: str
    description: Optional[str] = ""
    price: float = 0
    image_url: Optional[str] = ""
    is_active: Optional[bool] = True


class ServiceUpdate(BaseModel):
    category_id: Optional[str] = None
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    image_url: Optional[str] = None
    is_active: Optional[bool] = None
