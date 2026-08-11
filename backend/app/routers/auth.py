from fastapi import APIRouter, Depends, HTTPException, status
from app.dependencies import get_current_admin, get_supabase_admin
from app.schemas.auth import AdminVerifyResponse, AdminProfileUpdate
from supabase import Client

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/verify-admin", response_model=AdminVerifyResponse)
async def verify_admin(admin: dict = Depends(get_current_admin)):
    """Verify admin token and return profile info.
    The get_current_admin dependency already checks approval status."""
    return AdminVerifyResponse(
        id=admin["id"],
        email=admin["email"],
        full_name=admin.get("full_name", ""),
        approval_status=admin["approval_status"],
    )


@router.put("/profile")
async def update_admin_profile(
    data: AdminProfileUpdate,
    admin: dict = Depends(get_current_admin),
    supabase: Client = Depends(get_supabase_admin),
):
    """Update the current admin's profile (name only, not approval_status)."""
    update_data = data.model_dump(exclude_none=True)
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update",
        )

    result = (
        supabase.table("admin_profiles")
        .update(update_data)
        .eq("id", admin["id"])
        .execute()
    )
    return {"message": "Profile updated successfully", "data": result.data[0] if result.data else None}
