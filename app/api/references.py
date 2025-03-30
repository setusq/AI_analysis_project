from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.crud import references as references_crud
from app.schemas.references import (
    TechnologyTypeCreate, TechnologyTypeResponse,
    DevelopmentStageCreate, DevelopmentStageResponse,
    RegionCreate, RegionResponse,
    OrganizationCreate, OrganizationResponse,
    PersonCreate, PersonResponse,
    DirectionCreate, DirectionResponse
)

router = APIRouter()

# Technology Type endpoints
@router.get("/technology-types/", response_model=List[TechnologyTypeResponse])
def read_technology_types(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return references_crud.get_technology_types(db, skip=skip, limit=limit)

@router.post("/technology-types/", response_model=TechnologyTypeResponse)
def create_technology_type(type_: TechnologyTypeCreate, db: Session = Depends(get_db)):
    return references_crud.create_technology_type(db=db, type_=type_)

# Development Stage endpoints
@router.get("/development-stages/", response_model=List[DevelopmentStageResponse])
def read_development_stages(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return references_crud.get_development_stages(db, skip=skip, limit=limit)

@router.post("/development-stages/", response_model=DevelopmentStageResponse)
def create_development_stage(stage: DevelopmentStageCreate, db: Session = Depends(get_db)):
    return references_crud.create_development_stage(db=db, stage=stage)

# Region endpoints
@router.get("/regions/", response_model=List[RegionResponse])
def read_regions(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return references_crud.get_regions(db, skip=skip, limit=limit)

@router.post("/regions/", response_model=RegionResponse)
def create_region(region: RegionCreate, db: Session = Depends(get_db)):
    return references_crud.create_region(db=db, region=region)

# Organization endpoints
@router.get("/organizations/", response_model=List[OrganizationResponse])
def read_organizations(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return references_crud.get_organizations(db, skip=skip, limit=limit)

@router.post("/organizations/", response_model=OrganizationResponse)
def create_organization(org: OrganizationCreate, db: Session = Depends(get_db)):
    return references_crud.create_organization(db=db, org=org)

# Person endpoints
@router.get("/people/", response_model=List[PersonResponse])
def read_people(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return references_crud.get_people(db, skip=skip, limit=limit)

@router.post("/people/", response_model=PersonResponse)
def create_person(person: PersonCreate, db: Session = Depends(get_db)):
    return references_crud.create_person(db=db, person=person)

# Direction endpoints
@router.get("/directions/", response_model=List[DirectionResponse])
def read_directions(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return references_crud.get_directions(db, skip=skip, limit=limit)

@router.post("/directions/", response_model=DirectionResponse)
def create_direction(direction: DirectionCreate, db: Session = Depends(get_db)):
    return references_crud.create_direction(db=db, direction=direction) 