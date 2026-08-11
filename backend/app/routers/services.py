from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query
from app.dependencies import get_current_admin, get_supabase_admin
from app.schemas.services import (
    ServiceCategoryCreate,
    ServiceCategoryUpdate,
    ServiceCreate,
    ServiceUpdate,
)
from supabase import Client
from typing import Optional
import uuid

router = APIRouter(prefix="/services", tags=["Services"])


# ============================================================
# Service Categories
# ============================================================

@router.get("/categories")
async def get_service_categories(
    active_only: bool = Query(True, description="If true, return only active categories"),
    supabase: Client = Depends(get_supabase_admin),
):
    """Get service categories. Public can see active only; admins see all."""
    query = supabase.table("service_categories").select("*")
    if active_only:
        query = query.eq("is_active", True)
    result = query.order("display_order").execute()
    return result.data


@router.post("/categories")
async def create_service_category(
    data: ServiceCategoryCreate,
    admin: dict = Depends(get_current_admin),
    supabase: Client = Depends(get_supabase_admin),
):
    """Create a new service category (admin only)."""
    result = (
        supabase.table("service_categories")
        .insert(data.model_dump())
        .execute()
    )
    return {"message": "Category created successfully", "data": result.data[0]}


@router.put("/categories/{category_id}")
async def update_service_category(
    category_id: str,
    data: ServiceCategoryUpdate,
    admin: dict = Depends(get_current_admin),
    supabase: Client = Depends(get_supabase_admin),
):
    """Update a service category (admin only)."""
    update_data = data.model_dump(exclude_none=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    result = (
        supabase.table("service_categories")
        .update(update_data)
        .eq("id", category_id)
        .execute()
    )

    if not result.data:
        raise HTTPException(status_code=404, detail="Category not found")

    return {"message": "Category updated successfully", "data": result.data[0]}


@router.delete("/categories/{category_id}")
async def delete_service_category(
    category_id: str,
    admin: dict = Depends(get_current_admin),
    supabase: Client = Depends(get_supabase_admin),
):
    """Soft-delete a service category (set is_active=false). Admin only."""
    # Check if category has services
    services = (
        supabase.table("services")
        .select("id")
        .eq("category_id", category_id)
        .eq("is_active", True)
        .execute()
    )

    if services.data:
        # Soft-delete: deactivate the category and its services
        supabase.table("services").update({"is_active": False}).eq("category_id", category_id).execute()

    result = (
        supabase.table("service_categories")
        .update({"is_active": False})
        .eq("id", category_id)
        .execute()
    )

    if not result.data:
        raise HTTPException(status_code=404, detail="Category not found")

    return {"message": "Category deactivated successfully"}


# ============================================================
# Services
# ============================================================

@router.get("/")
async def get_services(
    category_id: Optional[str] = Query(None, description="Filter by category"),
    active_only: bool = Query(True),
    supabase: Client = Depends(get_supabase_admin),
):
    """Get services with optional category filter. Public sees active only."""
    query = supabase.table("services").select("*, service_categories(name)")
    if active_only:
        query = query.eq("is_active", True)
    if category_id:
        query = query.eq("category_id", category_id)
    result = query.order("created_at", desc=True).execute()
    return result.data


@router.get("/all")
async def get_all_services(
    admin: dict = Depends(get_current_admin),
    supabase: Client = Depends(get_supabase_admin),
):
    """Get all services including inactive (admin only)."""
    result = (
        supabase.table("services")
        .select("*, service_categories(name)")
        .order("created_at", desc=True)
        .execute()
    )
    return result.data


@router.post("/")
async def create_service(
    data: ServiceCreate,
    admin: dict = Depends(get_current_admin),
    supabase: Client = Depends(get_supabase_admin),
):
    """Create a new service (admin only)."""
    result = (
        supabase.table("services")
        .insert(data.model_dump())
        .execute()
    )
    return {"message": "Service created successfully", "data": result.data[0]}


@router.put("/{service_id}")
async def update_service(
    service_id: str,
    data: ServiceUpdate,
    admin: dict = Depends(get_current_admin),
    supabase: Client = Depends(get_supabase_admin),
):
    """Update a service (admin only)."""
    update_data = data.model_dump(exclude_none=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    result = (
        supabase.table("services")
        .update(update_data)
        .eq("id", service_id)
        .execute()
    )

    if not result.data:
        raise HTTPException(status_code=404, detail="Service not found")

    return {"message": "Service updated successfully", "data": result.data[0]}


@router.delete("/{service_id}")
async def delete_service(
    service_id: str,
    admin: dict = Depends(get_current_admin),
    supabase: Client = Depends(get_supabase_admin),
):
    """Soft-delete a service (admin only)."""
    result = (
        supabase.table("services")
        .update({"is_active": False})
        .eq("id", service_id)
        .execute()
    )

    if not result.data:
        raise HTTPException(status_code=404, detail="Service not found")

    return {"message": "Service deactivated successfully"}


@router.post("/upload-image")
async def upload_service_image(
    file: UploadFile = File(...),
    admin: dict = Depends(get_current_admin),
    supabase: Client = Depends(get_supabase_admin),
):
    """Upload a service image to Supabase Storage (admin only)."""
    allowed_types = ["image/jpeg", "image/png", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="File type not allowed. Use JPEG, PNG, or WebP.")

    content = await file.read()
    if len(content) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size must be less than 5MB")

    ext = file.filename.split(".")[-1] if "." in file.filename else "png"
    filename = f"service_{uuid.uuid4().hex[:8]}.{ext}"

    try:
        supabase.storage.from_("service-images").upload(
            filename,
            content,
            file_options={"content-type": file.content_type, "upsert": "true"},
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

    public_url = supabase.storage.from_("service-images").get_public_url(filename)
    return {"message": "Image uploaded successfully", "url": public_url}
