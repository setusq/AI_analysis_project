from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.research import Research
from app.schemas.research import ResearchCreate, ResearchUpdate, ResearchFilter

def get_research(db: Session, research_id: int) -> Optional[Research]:
    return db.query(Research).filter(Research.id == research_id).first()

def get_research_list(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    filters: Optional[ResearchFilter] = None
) -> List[Research]:
    query = db.query(Research)
    
    if filters:
        if filters.technology_type_id:
            query = query.filter(Research.technology_type_id == filters.technology_type_id)
        if filters.development_stage_id:
            query = query.filter(Research.development_stage_id == filters.development_stage_id)
        if filters.region_ids:
            query = query.join(Research.regions).filter(Research.regions.any(id__in=filters.region_ids))
        if filters.organization_ids:
            query = query.join(Research.organizations).filter(Research.organizations.any(id__in=filters.organization_ids))
        if filters.person_ids:
            query = query.join(Research.people).filter(Research.people.any(id__in=filters.person_ids))
        if filters.direction_ids:
            query = query.join(Research.directions).filter(Research.directions.any(id__in=filters.direction_ids))
    
    return query.offset(skip).limit(limit).all()

def create_research(db: Session, research: ResearchCreate) -> Research:
    db_research = Research(
        name=research.name,
        description=research.description,
        technology_type_id=research.technology_type_id,
        development_stage_id=research.development_stage_id,
        start_date=research.start_date,
        source_link=research.source_link
    )
    
    if research.region_ids:
        db_research.regions = db.query(Region).filter(Region.id.in_(research.region_ids)).all()
    if research.organization_ids:
        db_research.organizations = db.query(Organization).filter(Organization.id.in_(research.organization_ids)).all()
    if research.person_ids:
        db_research.people = db.query(Person).filter(Person.id.in_(research.person_ids)).all()
    if research.direction_ids:
        db_research.directions = db.query(Direction).filter(Direction.id.in_(research.direction_ids)).all()
    
    db.add(db_research)
    db.commit()
    db.refresh(db_research)
    return db_research

def update_research(db: Session, research_id: int, research: ResearchUpdate) -> Optional[Research]:
    db_research = get_research(db, research_id)
    if not db_research:
        return None
    
    update_data = research.dict(exclude_unset=True)
    
    for field, value in update_data.items():
        if field not in ['region_ids', 'organization_ids', 'person_ids', 'direction_ids']:
            setattr(db_research, field, value)
    
    if research.region_ids is not None:
        db_research.regions = db.query(Region).filter(Region.id.in_(research.region_ids)).all()
    if research.organization_ids is not None:
        db_research.organizations = db.query(Organization).filter(Organization.id.in_(research.organization_ids)).all()
    if research.person_ids is not None:
        db_research.people = db.query(Person).filter(Person.id.in_(research.person_ids)).all()
    if research.direction_ids is not None:
        db_research.directions = db.query(Direction).filter(Direction.id.in_(research.direction_ids)).all()
    
    db.commit()
    db.refresh(db_research)
    return db_research

def delete_research(db: Session, research_id: int) -> bool:
    db_research = get_research(db, research_id)
    if not db_research:
        return False
    
    db.delete(db_research)
    db.commit()
    return True 