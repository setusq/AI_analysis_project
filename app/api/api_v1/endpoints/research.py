from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models.research_development import ResearchDevelopment
from app.schemas.research import (
    ResearchCreate,
    ResearchUpdate,
    ResearchResponse,
    ResearchFilter,
)
from app.services import research_service

router = APIRouter()

@router.get("/", response_model=List[ResearchResponse])
def get_research_list(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    filter: Optional[ResearchFilter] = None,
):
    return research_service.get_research_list(db, skip=skip, limit=limit, filter=filter)

@router.get("/{research_id}", response_model=ResearchResponse)
def get_research(
    research_id: int,
    db: Session = Depends(get_db),
):
    research = research_service.get_research(db, research_id)
    if not research:
        raise HTTPException(status_code=404, detail="Research not found")
    return research

@router.post("/", response_model=ResearchResponse)
def create_research(
    research: ResearchCreate,
    db: Session = Depends(get_db),
):
    return research_service.create_research(db, research)

@router.put("/{research_id}", response_model=ResearchResponse)
def update_research(
    research_id: int,
    research: ResearchUpdate,
    db: Session = Depends(get_db),
):
    updated_research = research_service.update_research(db, research_id, research)
    if not updated_research:
        raise HTTPException(status_code=404, detail="Research not found")
    return updated_research

@router.delete("/{research_id}")
def delete_research(
    research_id: int,
    db: Session = Depends(get_db),
):
    success = research_service.delete_research(db, research_id)
    if not success:
        raise HTTPException(status_code=404, detail="Research not found")
    return {"message": "Research deleted successfully"}

@router.get("/stats/summary")
def get_research_stats(db: Session = Depends(get_db)):
    return research_service.get_research_stats(db) 