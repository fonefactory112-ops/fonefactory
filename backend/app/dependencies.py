from fastapi import Depends, HTTPException, status, Header
from supabase import create_client, Client
from app.config import get_settings, Settings
import httpx


def get_supabase_admin(settings: Settings = Depends(get_settings)) -> Client:
    """Get Supabase client with service_role key for admin operations.
    This bypasses RLS — use only for backend-protected operations."""
    return create_client(settings.supabase_url, settings.supabase_service_role_key)


def get_supabase_public(settings: Settings = Depends(get_settings)) -> Client:
    """Get Supabase client with anon key for public read operations."""
    return create_client(settings.supabase_url, settings.supabase_anon_key)


async def get_current_admin(
    authorization: str = Header(..., description="Bearer <token>"),
    settings: Settings = Depends(get_settings),
) -> dict:
    """Dependency that verifies JWT token AND checks admin approval status.

    Returns admin profile dict if valid and approved.
    Raises HTTPException otherwise.
    """
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header format",
        )

    token = authorization.split("Bearer ")[1]

    # Verify the JWT with Supabase
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{settings.supabase_url}/auth/v1/user",
                headers={
                    "Authorization": f"Bearer {token}",
                    "apikey": settings.supabase_anon_key,
                },
            )

            if response.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid or expired token",
                )

            user_data = response.json()
            user_id = user_data.get("id")

            if not user_id:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Could not extract user ID from token",
                )

    except httpx.RequestError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication service unavailable",
        )

    # Check approval status in admin_profiles using service_role
    supabase = create_client(settings.supabase_url, settings.supabase_service_role_key)
    result = (
        supabase.table("admin_profiles")
        .select("*")
        .eq("id", user_id)
        .execute()
    )

    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin profile not found",
        )

    admin = result.data[0]

    if admin["approval_status"] == "pending":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your admin account is pending approval. Please contact the administrator.",
        )

    if admin["approval_status"] == "rejected":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your admin access has been rejected.",
        )

    if admin["approval_status"] != "approved":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )

    return {**admin, "token": token}
