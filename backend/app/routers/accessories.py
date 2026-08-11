from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query
from app.dependencies import get_current_admin, get_supabase_admin
from app.schemas.accessories import (
    AccessoryCategoryCreate,
    AccessoryCategoryUpdate,
    AccessoryCreate,
    AccessoryUpdate,
)
from supabase import Client
from typing import Optional
import uuid

router = APIRouter(prefix="/accessories", tags=["Accessories"])


# ============================================================
# Accessory Categories
# ============================================================

@router.get("/categories")
async def get_accessory_categories(
    active_only: bool = Query(True),
    supabase: Client = Depends(get_supabase_admin),
):
    """Get accessory categories."""
    query = supabase.table("accessory_categories").select("*")
    if active_only:
        query = query.eq("is_active", True)
    result = query.order("display_order").execute()
    return result.data


@router.post("/categories")
async def create_accessory_category(
    data: AccessoryCategoryCreate,
    admin: dict = Depends(get_current_admin),
    supabase: Client = Depends(get_supabase_admin),
):
    """Create a new accessory category (admin only)."""
    result = (
        supabase.table("accessory_categories")
        .insert(data.model_dump())
        .execute()
    )
    return {"message": "Category created successfully", "data": result.data[0]}


@router.put("/categories/{category_id}")
async def update_accessory_category(
    category_id: str,
    data: AccessoryCategoryUpdate,
    admin: dict = Depends(get_current_admin),
    supabase: Client = Depends(get_supabase_admin),
):
    """Update an accessory category (admin only)."""
    update_data = data.model_dump(exclude_none=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    result = (
        supabase.table("accessory_categories")
        .update(update_data)
        .eq("id", category_id)
        .execute()
    )

    if not result.data:
        raise HTTPException(status_code=404, detail="Category not found")

    return {"message": "Category updated successfully", "data": result.data[0]}


@router.delete("/categories/{category_id}")
async def delete_accessory_category(
    category_id: str,
    admin: dict = Depends(get_current_admin),
    supabase: Client = Depends(get_supabase_admin),
):
    """Soft-delete an accessory category (admin only)."""
    accessories = (
        supabase.table("accessories")
        .select("id")
        .eq("category_id", category_id)
        .eq("is_active", True)
        .execute()
    )

    if accessories.data:
        supabase.table("accessories").update({"is_active": False}).eq("category_id", category_id).execute()

    result = (
        supabase.table("accessory_categories")
        .update({"is_active": False})
        .eq("id", category_id)
        .execute()
    )

    if not result.data:
        raise HTTPException(status_code=404, detail="Category not found")

    return {"message": "Category deactivated successfully"}


# ============================================================
# Accessories
# ============================================================

@router.get("/")
async def get_accessories(
    category_id: Optional[str] = Query(None),
    active_only: bool = Query(True),
    supabase: Client = Depends(get_supabase_admin),
):
    """Get accessories with optional category filter."""
    query = supabase.table("accessories").select("*, accessory_categories(name)")
    if active_only:
        query = query.eq("is_active", True)
    if category_id:
        query = query.eq("category_id", category_id)
    result = query.order("created_at", desc=True).execute()
    return result.data


@router.get("/all")
async def get_all_accessories(
    admin: dict = Depends(get_current_admin),
    supabase: Client = Depends(get_supabase_admin),
):
    """Get all accessories including inactive (admin only)."""
    result = (
        supabase.table("accessories")
        .select("*, accessory_categories(name)")
        .order("created_at", desc=True)
        .execute()
    )
    return result.data


@router.post("/")
async def create_accessory(
    data: AccessoryCreate,
    admin: dict = Depends(get_current_admin),
    supabase: Client = Depends(get_supabase_admin),
):
    """Create a new accessory (admin only)."""
    result = (
        supabase.table("accessories")
        .insert(data.model_dump())
        .execute()
    )
    return {"message": "Accessory created successfully", "data": result.data[0]}


@router.put("/{accessory_id}")
async def update_accessory(
    accessory_id: str,
    data: AccessoryUpdate,
    admin: dict = Depends(get_current_admin),
    supabase: Client = Depends(get_supabase_admin),
):
    """Update an accessory (admin only)."""
    update_data = data.model_dump(exclude_none=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    result = (
        supabase.table("accessories")
        .update(update_data)
        .eq("id", accessory_id)
        .execute()
    )

    if not result.data:
        raise HTTPException(status_code=404, detail="Accessory not found")

    return {"message": "Accessory updated successfully", "data": result.data[0]}


@router.delete("/{accessory_id}")
async def delete_accessory(
    accessory_id: str,
    admin: dict = Depends(get_current_admin),
    supabase: Client = Depends(get_supabase_admin),
):
    """Soft-delete an accessory (admin only)."""
    result = (
        supabase.table("accessories")
        .update({"is_active": False})
        .eq("id", accessory_id)
        .execute()
    )

    if not result.data:
        raise HTTPException(status_code=404, detail="Accessory not found")

    return {"message": "Accessory deactivated successfully"}


@router.post("/upload-image")
async def upload_accessory_image(
    file: UploadFile = File(...),
    admin: dict = Depends(get_current_admin),
    supabase: Client = Depends(get_supabase_admin),
):
    """Upload an accessory image (admin only)."""
    allowed_types = ["image/jpeg", "image/png", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="File type not allowed. Use JPEG, PNG, or WebP.")

    content = await file.read()
    if len(content) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size must be less than 5MB")

    ext = file.filename.split(".")[-1] if "." in file.filename else "png"
    filename = f"accessory_{uuid.uuid4().hex[:8]}.{ext}"

    try:
        supabase.storage.from_("accessory-images").upload(
            filename,
            content,
            file_options={"content-type": file.content_type, "upsert": "true"},
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

    public_url = supabase.storage.from_("accessory-images").get_public_url(filename)
    return {"message": "Image uploaded successfully", "url": public_url}
