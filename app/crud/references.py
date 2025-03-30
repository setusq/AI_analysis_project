from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.references import (
    TechnologyType, DevelopmentStage, Region,
    Organization, Person, Direction
)
from app.schemas.references import (
    TechnologyTypeCreate, DevelopmentStageCreate,
    RegionCreate, OrganizationCreate, PersonCreate,
    DirectionCreate
)

# Technology Type CRUD
def get_technology_type(db: Session, type_id: int) -> Optional[TechnologyType]:
    return db.query(TechnologyType).filter(TechnologyType.id == type_id).first()

def get_technology_types(db: Session, skip: int = 0, limit: int = 100) -> List[TechnologyType]:
    return db.query(TechnologyType).offset(skip).limit(limit).all()

def create_technology_type(db: Session, type_: TechnologyTypeCreate) -> TechnologyType:
    db_type = TechnologyType(**type_.dict())
    db.add(db_type)
    db.commit()
    db.refresh(db_type)
    return db_type

# Development Stage CRUD
def get_development_stage(db: Session, stage_id: int) -> Optional[DevelopmentStage]:
    return db.query(DevelopmentStage).filter(DevelopmentStage.id == stage_id).first()

def get_development_stages(db: Session, skip: int = 0, limit: int = 100) -> List[DevelopmentStage]:
    return db.query(DevelopmentStage).offset(skip).limit(limit).all()

def create_development_stage(db: Session, stage: DevelopmentStageCreate) -> DevelopmentStage:
    db_stage = DevelopmentStage(**stage.dict())
    db.add(db_stage)
    db.commit()
    db.refresh(db_stage)
    return db_stage

# Region CRUD
def get_region(db: Session, region_id: int) -> Optional[Region]:
    return db.query(Region).filter(Region.id == region_id).first()

def get_regions(db: Session, skip: int = 0, limit: int = 100) -> List[Region]:
    return db.query(Region).offset(skip).limit(limit).all()

def create_region(db: Session, region: RegionCreate) -> Region:
    db_region = Region(**region.dict())
    db.add(db_region)
    db.commit()
    db.refresh(db_region)
    return db_region

# Organization CRUD
def get_organization(db: Session, org_id: int) -> Optional[Organization]:
    return db.query(Organization).filter(Organization.id == org_id).first()

def get_organizations(db: Session, skip: int = 0, limit: int = 100) -> List[Organization]:
    return db.query(Organization).offset(skip).limit(limit).all()

def create_organization(db: Session, org: OrganizationCreate) -> Organization:
    db_org = Organization(**org.dict())
    db.add(db_org)
    db.commit()
    db.refresh(db_org)
    return db_org

# Person CRUD
def get_person(db: Session, person_id: int) -> Optional[Person]:
    return db.query(Person).filter(Person.id == person_id).first()

def get_people(db: Session, skip: int = 0, limit: int = 100) -> List[Person]:
    return db.query(Person).offset(skip).limit(limit).all()

def create_person(db: Session, person: PersonCreate) -> Person:
    db_person = Person(**person.dict())
    db.add(db_person)
    db.commit()
    db.refresh(db_person)
    return db_person

# Direction CRUD
def get_direction(db: Session, direction_id: int) -> Optional[Direction]:
    return db.query(Direction).filter(Direction.id == direction_id).first()

def get_directions(db: Session, skip: int = 0, limit: int = 100) -> List[Direction]:
    return db.query(Direction).offset(skip).limit(limit).all()

def create_direction(db: Session, direction: DirectionCreate) -> Direction:
    db_direction = Direction(**direction.dict())
    db.add(db_direction)
    db.commit()
    db.refresh(db_direction)
    return db_direction 