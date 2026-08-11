from fastapi import APIRouter, Depends, HTTPException, status, Query
from app.dependencies import get_current_admin, get_supabase_admin
from app.config import get_settings, Settings
from app.schemas.enquiries import OTPSendRequest, OTPVerifyRequest, EnquiryCreate, EnquiryStatusUpdate
from supabase import Client
from typing import Optional
import httpx

router = APIRouter(prefix="/enquiries", tags=["Enquiries"])


@router.post("/send-otp")
async def send_otp(
    data: OTPSendRequest,
    settings: Settings = Depends(get_settings),
):
    """Send OTP to customer phone number via Supabase Auth."""
    phone = data.phone.strip()

    # Ensure phone has country code
    if not phone.startswith("+"):
        phone = f"+91{phone}"  # Default to India

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{settings.supabase_url}/auth/v1/otp",
                json={"phone": phone},
                headers={
                    "apikey": settings.supabase_anon_key,
                    "Content-Type": "application/json",
                },
            )

            if response.status_code not in (200, 201):
                error_detail = response.json().get("msg", response.text)
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Failed to send OTP: {error_detail}",
                )

        return {"message": "OTP sent successfully", "phone": phone}

    except httpx.RequestError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="OTP service is temporarily unavailable. Please try again.",
        )


@router.post("/verify-otp")
async def verify_otp(
    data: OTPVerifyRequest,
    settings: Settings = Depends(get_settings),
):
    """Verify OTP code entered by customer."""
    phone = data.phone.strip()
    if not phone.startswith("+"):
        phone = f"+91{phone}"

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{settings.supabase_url}/auth/v1/verify",
                json={
                    "phone": phone,
                    "token": data.otp_code,
                    "type": "sms",
                },
                headers={
                    "apikey": settings.supabase_anon_key,
                    "Content-Type": "application/json",
                },
            )

            if response.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid OTP code. Please try again.",
                )

            result = response.json()

        return {
            "message": "Phone number verified successfully",
            "phone": phone,
            "verified": True,
            "access_token": result.get("access_token", ""),
        }

    except httpx.RequestError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Verification service is temporarily unavailable.",
        )


@router.post("/")
async def create_enquiry(
    data: EnquiryCreate,
    supabase: Client = Depends(get_supabase_admin),
):
    """Create a new enquiry after phone verification.
    Uses service_role to insert (bypasses RLS for this controlled operation)."""

    # Validate enquiry type
    if data.type not in ("service", "accessory"):
        raise HTTPException(status_code=400, detail="Type must be 'service' or 'accessory'")

    # Validate the reference exists
    table = "services" if data.type == "service" else "accessories"
    ref = supabase.table(table).select("id, name").eq("id", data.reference_id).execute()

    if not ref.data:
        raise HTTPException(status_code=404, detail=f"{data.type.capitalize()} not found")

    # Check for duplicate enquiry (same phone + same reference within 24 hours)
    existing = (
        supabase.table("enquiries")
        .select("id")
        .eq("customer_phone", data.customer_phone)
        .eq("reference_id", data.reference_id)
        .eq("type", data.type)
        .gte("created_at", "now() - interval '24 hours'")
        .execute()
    )

    if existing.data:
        return {"message": "You have already enquired about this item.", "duplicate": True}

    # Create the enquiry
    enquiry_data = {
        "type": data.type,
        "reference_id": data.reference_id,
        "reference_name": data.reference_name,
        "category_name": data.category_name,
        "customer_phone": data.customer_phone,
        "verification_status": "verified",
        "enquiry_status": "new",
    }

    result = supabase.table("enquiries").insert(enquiry_data).execute()

    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create enquiry")

    return {"message": "Enquiry submitted successfully", "data": result.data[0], "duplicate": False}


@router.get("/")
async def get_enquiries(
    type_filter: Optional[str] = Query(None, alias="type"),
    status_filter: Optional[str] = Query(None, alias="status"),
    admin: dict = Depends(get_current_admin),
    supabase: Client = Depends(get_supabase_admin),
):
    """Get all enquiries with optional filters (admin only)."""
    query = supabase.table("enquiries").select("*")

    if type_filter:
        query = query.eq("type", type_filter)
    if status_filter:
        query = query.eq("enquiry_status", status_filter)

    result = query.order("created_at", desc=True).execute()
    return result.data


@router.get("/stats")
async def get_enquiry_stats(
    admin: dict = Depends(get_current_admin),
    supabase: Client = Depends(get_supabase_admin),
):
    """Get enquiry statistics for dashboard (admin only)."""
    all_enquiries = supabase.table("enquiries").select("*").execute()
    data = all_enquiries.data or []

    total = len(data)
    new_count = sum(1 for e in data if e["enquiry_status"] == "new")
    contacted = sum(1 for e in data if e["enquiry_status"] == "contacted")
    completed = sum(1 for e in data if e["enquiry_status"] == "completed")
    cancelled = sum(1 for e in data if e["enquiry_status"] == "cancelled")
    verified = sum(1 for e in data if e["verification_status"] == "verified")

    return {
        "total": total,
        "new": new_count,
        "contacted": contacted,
        "completed": completed,
        "cancelled": cancelled,
        "verified": verified,
    }


@router.put("/{enquiry_id}/status")
async def update_enquiry_status(
    enquiry_id: str,
    data: EnquiryStatusUpdate,
    admin: dict = Depends(get_current_admin),
    supabase: Client = Depends(get_supabase_admin),
):
    """Update enquiry status (admin only)."""
    valid_statuses = ["new", "contacted", "completed", "cancelled"]
    if data.enquiry_status not in valid_statuses:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}",
        )

    result = (
        supabase.table("enquiries")
        .update({"enquiry_status": data.enquiry_status})
        .eq("id", enquiry_id)
        .execute()
    )

    if not result.data:
        raise HTTPException(status_code=404, detail="Enquiry not found")

    return {"message": "Enquiry status updated", "data": result.data[0]}
