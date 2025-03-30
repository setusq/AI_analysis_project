from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.crud import research as research_crud
from app.schemas.research import ResearchCreate, ResearchUpdate, ResearchResponse, ResearchFilter

router = APIRouter()

@router.get("/research/{research_id}", response_model=ResearchResponse)
def read_research(research_id: int, db: Session = Depends(get_db)):
    db_research = research_crud.get_research(db, research_id)
    if db_research is None:
        raise HTTPException(status_code=404, detail="Research not found")
    return db_research

@router.get("/research/", response_model=List[ResearchResponse])
def read_research_list(
    skip: int = 0,
    limit: int = 100,
    filters: ResearchFilter = None,
    db: Session = Depends(get_db)
):
    research = research_crud.get_research_list(db, skip=skip, limit=limit, filters=filters)
    return research

@router.post("/research/", response_model=ResearchResponse)
def create_research(research: ResearchCreate, db: Session = Depends(get_db)):
    return research_crud.create_research(db=db, research=research)

@router.put("/research/{research_id}", response_model=ResearchResponse)
def update_research(
    research_id: int,
    research: ResearchUpdate,
    db: Session = Depends(get_db)
):
    db_research = research_crud.update_research(db=db, research_id=research_id, research=research)
    if db_research is None:
        raise HTTPException(status_code=404, detail="Research not found")
    return db_research

@router.delete("/research/{research_id}")
def delete_research(research_id: int, db: Session = Depends(get_db)):
    success = research_crud.delete_research(db=db, research_id=research_id)
    if not success:
        raise HTTPException(status_code=404, detail="Research not found")
    return {"message": "Research deleted successfully"} 