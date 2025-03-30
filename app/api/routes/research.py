from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
import logging
from app.db.session import get_db
from app.schemas.research import ResearchCreate, ResearchResponse, ResearchFilter, ResearchUpdate
from app.db.models.research import Research
from app.db.models.references import TechnologyType, DevelopmentStage, Region, Organization, Person, Direction

router = APIRouter(prefix="/api")
logger = logging.getLogger(__name__)

@router.post("/research/", response_model=ResearchResponse)
def create_research(research: ResearchCreate, db: Session = Depends(get_db)):
    try:
        # Создаем новое исследование
        db_research = Research(
            name=research.name,
            description=research.description,
            technology_type_id=research.technology_type_id,
            development_stage_id=research.development_stage_id,
            start_date=research.start_date,
            source_link=research.source_link
        )
        
        db.add(db_research)
        db.commit()
        db.refresh(db_research)
        
        # Добавляем связи с регионами
        if research.region_ids and len(research.region_ids) > 0:
            regions = db.query(Region).filter(Region.id.in_(research.region_ids)).all()
            db_research.regions = regions
        
        # Добавляем связи с организациями
        if research.organization_ids and len(research.organization_ids) > 0:
            organizations = db.query(Organization).filter(Organization.id.in_(research.organization_ids)).all()
            db_research.organizations = organizations
        
        # Добавляем связи с людьми
        if research.person_ids and len(research.person_ids) > 0:
            people = db.query(Person).filter(Person.id.in_(research.person_ids)).all()
            db_research.people = people
        
        # Добавляем связи с направлениями
        if research.direction_ids and len(research.direction_ids) > 0:
            directions = db.query(Direction).filter(Direction.id.in_(research.direction_ids)).all()
            db_research.directions = directions
        
        db.commit()
        db.refresh(db_research)
        
        logger.info(f"Создано новое исследование: {db_research.name}")
        return db_research
    except Exception as e:
        db.rollback()
        logger.error(f"Ошибка при создании исследования: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при создании исследования: {str(e)}"
        )

@router.put("/research/{research_id}", response_model=ResearchResponse)
def update_research(research_id: int, research: ResearchUpdate, db: Session = Depends(get_db)):
    try:
        # Получаем существующее исследование
        db_research = db.query(Research).filter(Research.id == research_id).first()
        if not db_research:
            raise HTTPException(status_code=404, detail="Исследование не найдено")
        
        # Обновляем основные поля
        db_research.name = research.name
        db_research.description = research.description
        db_research.technology_type_id = research.technology_type_id
        db_research.development_stage_id = research.development_stage_id
        db_research.start_date = research.start_date
        db_research.source_link = research.source_link
        
        # Обновляем связи с регионами
        if research.region_ids is not None:
            regions = db.query(Region).filter(Region.id.in_(research.region_ids)).all()
            db_research.regions = regions
        
        # Обновляем связи с организациями
        if research.organization_ids is not None:
            organizations = db.query(Organization).filter(Organization.id.in_(research.organization_ids)).all()
            db_research.organizations = organizations
        
        # Обновляем связи с людьми
        if research.person_ids is not None:
            people = db.query(Person).filter(Person.id.in_(research.person_ids)).all()
            db_research.people = people
        
        # Обновляем связи с направлениями
        if research.direction_ids is not None:
            directions = db.query(Direction).filter(Direction.id.in_(research.direction_ids)).all()
            db_research.directions = directions
        
        db.commit()
        db.refresh(db_research)
        
        logger.info(f"Обновлено исследование с ID {research_id}: {db_research.name}")
        return db_research
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Ошибка при обновлении исследования: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при обновлении исследования: {str(e)}"
        )

@router.get("/research/", response_model=List[ResearchResponse])
def get_research_list(
    name: Optional[str] = None,
    technology_type_id: Optional[int] = None,
    development_stage_id: Optional[int] = None,
    region_id: Optional[int] = None,
    organization_id: Optional[int] = None,
    person_id: Optional[int] = None,
    direction_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    try:
        query = db.query(Research)
        
        # Применяем фильтры, если они переданы
        if name:
            query = query.filter(Research.name.ilike(f"%{name}%"))
            
        if technology_type_id:
            query = query.filter(Research.technology_type_id == technology_type_id)
            
        if development_stage_id:
            query = query.filter(Research.development_stage_id == development_stage_id)
            
        if region_id:
            query = query.join(Research.regions).filter(Region.id == region_id)
            
        if organization_id:
            query = query.join(Research.organizations).filter(Organization.id == organization_id)
            
        if person_id:
            query = query.join(Research.people).filter(Person.id == person_id)
            
        if direction_id:
            query = query.join(Research.directions).filter(Direction.id == direction_id)
        
        research_list = query.all()
        logger.info(f"Запрошен список исследований. Найдено: {len(research_list)} записей")
        return research_list
    except Exception as e:
        logger.error(f"Ошибка при получении списка исследований: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при получении списка исследований: {str(e)}"
        )

@router.get("/research/{research_id}", response_model=ResearchResponse)
def get_research(research_id: int, db: Session = Depends(get_db)):
    try:
        research = db.query(Research).filter(Research.id == research_id).first()
        if not research:
            raise HTTPException(status_code=404, detail="Исследование не найдено")
        logger.info(f"Запрошено исследование с ID {research_id}")
        return research
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Ошибка при получении исследования: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при получении исследования: {str(e)}"
        ) 