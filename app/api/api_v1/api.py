from fastapi import APIRouter
from app.api.api_v1.endpoints import research, references

api_router = APIRouter()

api_router.include_router(research.router, prefix="/research", tags=["research"])
api_router.include_router(references.router, prefix="/references", tags=["references"]) 