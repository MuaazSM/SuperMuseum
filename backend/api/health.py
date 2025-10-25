"""health check endpoints for the service."""
from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
async def health_check():
    """simple health check returning service status."""
    return {"status": "ok"}
