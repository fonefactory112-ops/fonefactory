from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from app.dependencies import get_current_admin, get_supabase_admin, get_supabase_public
from app.schemas.shop import ShopSettingsUpdate
from supabase import Client
import uuid

router = APIRouter(prefix="/shop", tags=["Shop Settings"])


@router.get("/settings")
async def get_shop_settings(supabase: Client = Depends(get_supabase_admin)):
    """Get shop settings (public endpoint)."""
    result = supabase.table("shop_settings").select("*").eq("id", 1).execute()
    if not result.data:
        return {
            "id": 1,
            "shop_name": "Fone Factory",
            "about_description": "",
            "phone_number": "",
            "email": "",
            "address": "",
            "working_hours": "",
            "logo_url": "",
            "founder_name": "",
            "founder_description": "",
            "founder_photo_url": "",
            "footer_text": "Farhaan Pvt Presents",
        }
    return result.data[0]


@router.put("/settings")
async def update_shop_settings(
    data: ShopSettingsUpdate,
    admin: dict = Depends(get_current_admin),
    supabase: Client = Depends(get_supabase_admin),
):
    """Update shop settings (admin only)."""
    update_data = data.model_dump(exclude_none=True)
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update",
        )

    result = (
        supabase.table("shop_settings")
        .update(update_data)
        .eq("id", 1)
        .execute()
    )

    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shop settings not found. Run seed data first.",
        )

    return {"message": "Shop settings updated successfully", "data": result.data[0]}


@router.post("/upload/{asset_type}")
async def upload_shop_asset(
    asset_type: str,
    file: UploadFile = File(...),
    admin: dict = Depends(get_current_admin),
    supabase: Client = Depends(get_supabase_admin),
):
    """Upload shop asset (logo or founder_photo). Admin only.

    asset_type: 'logo' or 'founder_photo'
    """
    if asset_type not in ("logo", "founder_photo"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="asset_type must be 'logo' or 'founder_photo'",
        )

    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type {file.content_type} not allowed. Use JPEG, PNG, WebP, or SVG.",
        )

    # Read file content
    content = await file.read()
    if len(content) > 5 * 1024 * 1024:  # 5MB limit
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size must be less than 5MB",
        )

    # Generate unique filename
    ext = file.filename.split(".")[-1] if "." in file.filename else "png"
    filename = f"{asset_type}_{uuid.uuid4().hex[:8]}.{ext}"
    file_path = f"{asset_type}/{filename}"

    # Upload to Supabase Storage
    try:
        supabase.storage.from_("shop-assets").upload(
            file_path,
            content,
            file_options={"content-type": file.content_type, "upsert": "true"},
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload file: {str(e)}",
        )

    # Get public URL
    public_url = supabase.storage.from_("shop-assets").get_public_url(file_path)

    # Update shop settings with new URL
    url_field = "logo_url" if asset_type == "logo" else "founder_photo_url"
    supabase.table("shop_settings").update({url_field: public_url}).eq("id", 1).execute()

    return {"message": "File uploaded successfully", "url": public_url}
