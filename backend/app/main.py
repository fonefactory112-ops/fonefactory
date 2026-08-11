from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.dependencies import get_current_admin, get_supabase_admin
from app.routers import auth, shop, services, accessories, enquiries
from supabase import Client

settings = get_settings()

app = FastAPI(
    title="Fone Factory API",
    description="Backend API for Fone Factory mobile phone shop",
    version="1.0.0",
)

# CORS configuration
allowed_origins = [
    settings.frontend_url,
    "http://localhost:5173",
    "http://localhost:3000",
]

# Filter out empty strings and duplicates
allowed_origins = list(set(origin for origin in allowed_origins if origin))

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Mount routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(shop.router, prefix="/api/v1")
app.include_router(services.router, prefix="/api/v1")
app.include_router(accessories.router, prefix="/api/v1")
app.include_router(enquiries.router, prefix="/api/v1")


@app.get("/")
async def root():
    return {"message": "Fone Factory API is running", "version": "1.0.0"}


@app.get("/api/v1/health")
async def health_check():
    return {"status": "healthy"}


@app.get("/api/v1/dashboard/stats")
async def get_dashboard_stats(
    admin: dict = Depends(get_current_admin),
    supabase: Client = Depends(get_supabase_admin),
):
    """Get dashboard summary statistics (admin only)."""
    services_data = supabase.table("services").select("id, is_active").execute()
    accessories_data = supabase.table("accessories").select("id, is_active").execute()
    service_cats = supabase.table("service_categories").select("id, is_active").execute()
    accessory_cats = supabase.table("accessory_categories").select("id, is_active").execute()
    enquiries_data = supabase.table("enquiries").select("id, enquiry_status, verification_status").execute()

    all_services = services_data.data or []
    all_accessories = accessories_data.data or []
    all_service_cats = service_cats.data or []
    all_accessory_cats = accessory_cats.data or []
    all_enquiries = enquiries_data.data or []

    return {
        "total_services": len([s for s in all_services if s.get("is_active", True)]),
        "total_accessories": len([a for a in all_accessories if a.get("is_active", True)]),
        "total_categories": (
            len([c for c in all_service_cats if c.get("is_active", True)])
            + len([c for c in all_accessory_cats if c.get("is_active", True)])
        ),
        "total_enquiries": len(all_enquiries),
        "new_enquiries": len([e for e in all_enquiries if e["enquiry_status"] == "new"]),
        "verified_enquiries": len([e for e in all_enquiries if e["verification_status"] == "verified"]),
    }
