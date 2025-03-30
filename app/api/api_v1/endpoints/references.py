from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.references import (
    TechnologyTypeCreate,
    TechnologyTypeResponse,
    DevelopmentStageCreate,
    DevelopmentStageResponse,
    RegionCreate,
    RegionResponse,
)
from app.services import reference_service

router = APIRouter()

# Technology Types
@router.get("/technology-types", response_model=List[TechnologyTypeResponse])
def get_technology_types(db: Session = Depends(get_db)):
    return reference_service.get_technology_types(db)

@router.post("/technology-types", response_model=TechnologyTypeResponse)
def create_technology_type(
    technology_type: TechnologyTypeCreate,
    db: Session = Depends(get_db),
):
    return reference_service.create_technology_type(db, technology_type)

@router.put("/technology-types/{type_id}", response_model=TechnologyTypeResponse)
def update_technology_type(
    type_id: int,
    technology_type: TechnologyTypeCreate,
    db: Session = Depends(get_db),
):
    updated_type = reference_service.update_technology_type(db, type_id, technology_type)
    if not updated_type:
        raise HTTPException(status_code=404, detail="Technology type not found")
    return updated_type

@router.delete("/technology-types/{type_id}")
def delete_technology_type(type_id: int, db: Session = Depends(get_db)):
    success = reference_service.delete_technology_type(db, type_id)
    if not success:
        raise HTTPException(status_code=404, detail="Technology type not found")
    return {"message": "Technology type deleted successfully"}

# Development Stages
@router.get("/development-stages", response_model=List[DevelopmentStageResponse])
def get_development_stages(db: Session = Depends(get_db)):
    return reference_service.get_development_stages(db)

@router.post("/development-stages", response_model=DevelopmentStageResponse)
def create_development_stage(
    stage: DevelopmentStageCreate,
    db: Session = Depends(get_db),
):
    return reference_service.create_development_stage(db, stage)

@router.put("/development-stages/{stage_id}", response_model=DevelopmentStageResponse)
def update_development_stage(
    stage_id: int,
    stage: DevelopmentStageCreate,
    db: Session = Depends(get_db),
):
    updated_stage = reference_service.update_development_stage(db, stage_id, stage)
    if not updated_stage:
        raise HTTPException(status_code=404, detail="Development stage not found")
    return updated_stage

@router.delete("/development-stages/{stage_id}")
def delete_development_stage(stage_id: int, db: Session = Depends(get_db)):
    success = reference_service.delete_development_stage(db, stage_id)
    if not success:
        raise HTTPException(status_code=404, detail="Development stage not found")
    return {"message": "Development stage deleted successfully"}

# Regions
@router.get("/regions", response_model=List[RegionResponse])
def get_regions(db: Session = Depends(get_db)):
    return reference_service.get_regions(db)

@router.post("/regions", response_model=RegionResponse)
def create_region(
    region: RegionCreate,
    db: Session = Depends(get_db),
):
    return reference_service.create_region(db, region)

@router.put("/regions/{region_id}", response_model=RegionResponse)
def update_region(
    region_id: int,
    region: RegionCreate,
    db: Session = Depends(get_db),
):
    updated_region = reference_service.update_region(db, region_id, region)
    if not updated_region:
        raise HTTPException(status_code=404, detail="Region not found")
    return updated_region

@router.delete("/regions/{region_id}")
def delete_region(region_id: int, db: Session = Depends(get_db)):
    success = reference_service.delete_region(db, region_id)
    if not success:
        raise HTTPException(status_code=404, detail="Region not found")
    return {"message": "Region deleted successfully"} 