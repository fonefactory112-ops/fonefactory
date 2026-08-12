from fastapi import APIRouter, Depends, HTTPException, status, Query
from app.dependencies import get_current_admin, get_supabase_admin
from app.config import get_settings, Settings
from app.schemas.enquiries import EnquiryCreate, EnquiryStatusUpdate
from supabase import Client
from typing import Optional
import httpx
import re
from datetime import datetime, timedelta, timezone

router = APIRouter(prefix="/enquiries", tags=["Enquiries"])

# Valid Indian mobile number in E.164: +91 followed by 10 digits starting with 6-9
INDIAN_MOBILE_PATTERN = re.compile(r"^\+91[6-9]\d{9}$")


def normalize_indian_phone(raw_phone: str) -> str:
    """Normalize an Indian phone number to E.164 format (+91XXXXXXXXXX).

    Handles inputs like:
      - "9876543210"       -> "+919876543210"
      - "919876543210"     -> "+919876543210"
      - "+919876543210"    -> "+919876543210"
      - "  98765 43210  "  -> "+919876543210"

    Raises HTTPException 400 if the result is not a valid Indian mobile number.
    """
    # Strip whitespace, dashes, dots, parentheses
    phone = re.sub(r"[\s\-\.\(\)]+", "", raw_phone.strip())

    if phone.startswith("+91"):
        pass  # already has country code
    elif phone.startswith("91") and len(phone) == 12:
        phone = f"+{phone}"
    elif len(phone) == 10:
        phone = f"+91{phone}"
    elif not phone.startswith("+"):
        phone = f"+91{phone}"

    if not INDIAN_MOBILE_PATTERN.match(phone):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid Indian mobile number. Please enter a valid 10-digit number starting with 6-9.",
        )

    return phone





@router.post("/")
async def create_enquiry(
    data: EnquiryCreate,
    supabase: Client = Depends(get_supabase_admin),
):
    """Create a new enquiry."""
    if not data.customer_name.strip():
        raise HTTPException(status_code=400, detail="Name cannot be empty")

    phone = normalize_indian_phone(data.customer_phone)

    # Validate enquiry type
    if data.type not in ("service", "accessory"):
        raise HTTPException(status_code=400, detail="Type must be 'service' or 'accessory'")

    # Validate the reference exists
    table = "services" if data.type == "service" else "accessories"
    ref = supabase.table(table).select("id, name").eq("id", data.reference_id).execute()

    if not ref.data:
        raise HTTPException(status_code=404, detail=f"{data.type.capitalize()} not found")

    # Check for duplicate enquiry (same phone + same reference within 24 hours)
    time_threshold = (datetime.now(timezone.utc) - timedelta(hours=24)).isoformat()
    existing = (
        supabase.table("enquiries")
        .select("id")
        .eq("customer_phone", phone)
        .eq("reference_id", data.reference_id)
        .eq("type", data.type)
        .gte("created_at", time_threshold)
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
        "customer_name": data.customer_name.strip(),
        "customer_phone": phone,
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
