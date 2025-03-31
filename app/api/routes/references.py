from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List
import logging
from app.db.session import get_db
from app.schemas.references import (
    TechnologyTypeResponse, DevelopmentStageResponse, RegionResponse,
    OrganizationResponse, PersonResponse, DirectionResponse, SourceResponse,
    ReferenceCreate, ReferenceUpdate, SourceCreate, SourceUpdate
)
from app.db.models.references import (
    TechnologyType, DevelopmentStage, Region,
    Organization, Person, Direction, Source
)

router = APIRouter(prefix="/api")
logger = logging.getLogger(__name__)

# Маршруты для типов технологий
@router.get("/technology-types/", response_model=List[TechnologyTypeResponse])
@router.get("/references/technology-types", response_model=List[TechnologyTypeResponse])
def get_technology_types(db: Session = Depends(get_db)):
    items = db.query(TechnologyType).all()
    logger.info(f"Запрошены типы технологий. Найдено: {len(items)} записей")
    return items

@router.post("/technology-types/", response_model=TechnologyTypeResponse)
@router.post("/references/technology-types", response_model=TechnologyTypeResponse)
def create_technology_type(item: ReferenceCreate, db: Session = Depends(get_db)):
    db_item = TechnologyType(name=item.name, description=item.description)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    logger.info(f"Создан новый тип технологии: {item.name}")
    return db_item

@router.put("/technology-types/{item_id}", response_model=TechnologyTypeResponse)
@router.put("/references/technology-types/{item_id}", response_model=TechnologyTypeResponse)
def update_technology_type(item_id: int, item: ReferenceUpdate, db: Session = Depends(get_db)):
    db_item = db.query(TechnologyType).filter(TechnologyType.id == item_id).first()
    if db_item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Тип технологии не найден")
    
    db_item.name = item.name
    if item.description is not None:
        db_item.description = item.description
    
    db.commit()
    db.refresh(db_item)
    logger.info(f"Обновлен тип технологии с ID {item_id}: {item.name}")
    return db_item

@router.delete("/technology-types/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
@router.delete("/references/technology-types/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_technology_type(item_id: int, db: Session = Depends(get_db)):
    db_item = db.query(TechnologyType).filter(TechnologyType.id == item_id).first()
    if db_item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Тип технологии не найден")
    
    db.delete(db_item)
    db.commit()
    logger.info(f"Удален тип технологии с ID {item_id}")
    return None

# Маршруты для этапов разработки
@router.get("/development-stages/", response_model=List[DevelopmentStageResponse])
@router.get("/references/development-stages", response_model=List[DevelopmentStageResponse])
def get_development_stages(db: Session = Depends(get_db)):
    items = db.query(DevelopmentStage).all()
    logger.info(f"Запрошены этапы разработки. Найдено: {len(items)} записей")
    return items

@router.post("/development-stages/", response_model=DevelopmentStageResponse)
@router.post("/references/development-stages", response_model=DevelopmentStageResponse)
def create_development_stage(item: ReferenceCreate, db: Session = Depends(get_db)):
    db_item = DevelopmentStage(name=item.name, description=item.description)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    logger.info(f"Создан новый этап разработки: {item.name}")
    return db_item

@router.put("/development-stages/{item_id}", response_model=DevelopmentStageResponse)
@router.put("/references/development-stages/{item_id}", response_model=DevelopmentStageResponse)
def update_development_stage(item_id: int, item: ReferenceUpdate, db: Session = Depends(get_db)):
    db_item = db.query(DevelopmentStage).filter(DevelopmentStage.id == item_id).first()
    if db_item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Этап разработки не найден")
    
    db_item.name = item.name
    if item.description is not None:
        db_item.description = item.description
    
    db.commit()
    db.refresh(db_item)
    logger.info(f"Обновлен этап разработки с ID {item_id}: {item.name}")
    return db_item

@router.delete("/development-stages/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
@router.delete("/references/development-stages/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_development_stage(item_id: int, db: Session = Depends(get_db)):
    db_item = db.query(DevelopmentStage).filter(DevelopmentStage.id == item_id).first()
    if db_item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Этап разработки не найден")
    
    db.delete(db_item)
    db.commit()
    logger.info(f"Удален этап разработки с ID {item_id}")
    return None

# Маршруты для регионов
@router.get("/regions/", response_model=List[RegionResponse])
@router.get("/references/regions", response_model=List[RegionResponse])
def get_regions(db: Session = Depends(get_db)):
    items = db.query(Region).all()
    logger.info(f"Запрошены регионы. Найдено: {len(items)} записей")
    return items

@router.post("/regions/", response_model=RegionResponse)
@router.post("/references/regions", response_model=RegionResponse)
def create_region(item: ReferenceCreate, db: Session = Depends(get_db)):
    db_item = Region(name=item.name, description=item.description)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    logger.info(f"Создан новый регион: {item.name}")
    return db_item

@router.put("/regions/{item_id}", response_model=RegionResponse)
@router.put("/references/regions/{item_id}", response_model=RegionResponse)
def update_region(item_id: int, item: ReferenceUpdate, db: Session = Depends(get_db)):
    db_item = db.query(Region).filter(Region.id == item_id).first()
    if db_item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Регион не найден")
    
    db_item.name = item.name
    if item.description is not None:
        db_item.description = item.description
    
    db.commit()
    db.refresh(db_item)
    logger.info(f"Обновлен регион с ID {item_id}: {item.name}")
    return db_item

@router.delete("/regions/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
@router.delete("/references/regions/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_region(item_id: int, db: Session = Depends(get_db)):
    db_item = db.query(Region).filter(Region.id == item_id).first()
    if db_item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Регион не найден")
    
    db.delete(db_item)
    db.commit()
    logger.info(f"Удален регион с ID {item_id}")
    return None

# Маршруты для организаций
@router.get("/organizations/", response_model=List[OrganizationResponse])
@router.get("/references/organizations", response_model=List[OrganizationResponse])
def get_organizations(db: Session = Depends(get_db)):
    items = db.query(Organization).options(joinedload(Organization.region)).all()
    logger.info(f"Запрошены организации. Найдено: {len(items)} записей")
    return items

@router.post("/organizations/", response_model=OrganizationResponse)
@router.post("/references/organizations", response_model=OrganizationResponse)
def create_organization(item: ReferenceCreate, db: Session = Depends(get_db)):
    db_item = Organization(
        name=item.name, 
        description=item.description,
        region_id=item.region_id
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    logger.info(f"Создана новая организация: {item.name}")
    return db_item

@router.put("/organizations/{item_id}", response_model=OrganizationResponse)
@router.put("/references/organizations/{item_id}", response_model=OrganizationResponse)
def update_organization(item_id: int, item: ReferenceUpdate, db: Session = Depends(get_db)):
    db_item = db.query(Organization).filter(Organization.id == item_id).first()
    if db_item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Организация не найдена")
    
    db_item.name = item.name
    if item.description is not None:
        db_item.description = item.description
    if item.region_id is not None:
        db_item.region_id = item.region_id
    
    db.commit()
    db.refresh(db_item)
    logger.info(f"Обновлена организация с ID {item_id}: {item.name}")
    return db_item

@router.delete("/organizations/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
@router.delete("/references/organizations/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_organization(item_id: int, db: Session = Depends(get_db)):
    db_item = db.query(Organization).filter(Organization.id == item_id).first()
    if db_item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Организация не найдена")
    
    db.delete(db_item)
    db.commit()
    logger.info(f"Удалена организация с ID {item_id}")
    return None

# Маршруты для людей
@router.get("/people/", response_model=List[PersonResponse])
@router.get("/references/people", response_model=List[PersonResponse])
def get_people(db: Session = Depends(get_db)):
    items = db.query(Person).all()
    logger.info(f"Запрошены люди. Найдено: {len(items)} записей")
    return items

@router.post("/people/", response_model=PersonResponse)
@router.post("/references/people", response_model=PersonResponse)
def create_person(item: ReferenceCreate, db: Session = Depends(get_db)):
    db_item = Person(name=item.name, description=item.description)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    logger.info(f"Создан новый человек: {item.name}")
    return db_item

@router.put("/people/{item_id}", response_model=PersonResponse)
@router.put("/references/people/{item_id}", response_model=PersonResponse)
def update_person(item_id: int, item: ReferenceUpdate, db: Session = Depends(get_db)):
    db_item = db.query(Person).filter(Person.id == item_id).first()
    if db_item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Человек не найден")
    
    db_item.name = item.name
    if item.description is not None:
        db_item.description = item.description
    
    db.commit()
    db.refresh(db_item)
    logger.info(f"Обновлена информация о человеке с ID {item_id}: {item.name}")
    return db_item

@router.delete("/people/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
@router.delete("/references/people/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_person(item_id: int, db: Session = Depends(get_db)):
    db_item = db.query(Person).filter(Person.id == item_id).first()
    if db_item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Человек не найден")
    
    db.delete(db_item)
    db.commit()
    logger.info(f"Удален человек с ID {item_id}")
    return None

# Маршруты для направлений
@router.get("/directions/", response_model=List[DirectionResponse])
@router.get("/references/directions", response_model=List[DirectionResponse])
def get_directions(db: Session = Depends(get_db)):
    items = db.query(Direction).all()
    logger.info(f"Запрошены направления. Найдено: {len(items)} записей")
    return items

@router.post("/directions/", response_model=DirectionResponse)
@router.post("/references/directions", response_model=DirectionResponse)
def create_direction(item: ReferenceCreate, db: Session = Depends(get_db)):
    db_item = Direction(name=item.name, description=item.description)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    logger.info(f"Создано новое направление: {item.name}")
    return db_item

@router.put("/directions/{item_id}", response_model=DirectionResponse)
@router.put("/references/directions/{item_id}", response_model=DirectionResponse)
def update_direction(item_id: int, item: ReferenceUpdate, db: Session = Depends(get_db)):
    db_item = db.query(Direction).filter(Direction.id == item_id).first()
    if db_item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Направление не найдено")
    
    db_item.name = item.name
    if item.description is not None:
        db_item.description = item.description
    
    db.commit()
    db.refresh(db_item)
    logger.info(f"Обновлено направление с ID {item_id}: {item.name}")
    return db_item

@router.delete("/directions/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
@router.delete("/references/directions/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_direction(item_id: int, db: Session = Depends(get_db)):
    db_item = db.query(Direction).filter(Direction.id == item_id).first()
    if db_item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Направление не найдено")
    
    db.delete(db_item)
    db.commit()
    logger.info(f"Удалено направление с ID {item_id}")
    return None

# Маршруты для источников
@router.get("/sources/", response_model=List[SourceResponse])
@router.get("/references/sources", response_model=List[SourceResponse])
def get_sources(db: Session = Depends(get_db)):
    items = db.query(Source).all()
    logger.info(f"Запрошены источники. Найдено: {len(items)} записей")
    return items

@router.post("/sources/", response_model=SourceResponse)
@router.post("/references/sources", response_model=SourceResponse)
def create_source(item: SourceCreate, db: Session = Depends(get_db)):
    db_item = Source(name=item.name, description=item.description, url=item.url)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    logger.info(f"Создан новый источник: {item.name}")
    return db_item

@router.put("/sources/{item_id}", response_model=SourceResponse)
@router.put("/references/sources/{item_id}", response_model=SourceResponse)
def update_source(item_id: int, item: SourceUpdate, db: Session = Depends(get_db)):
    db_item = db.query(Source).filter(Source.id == item_id).first()
    if db_item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Источник не найден")
    
    db_item.name = item.name
    if item.description is not None:
        db_item.description = item.description
    if item.url is not None:
        db_item.url = item.url
    
    db.commit()
    db.refresh(db_item)
    logger.info(f"Обновлен источник с ID {item_id}: {item.name}")
    return db_item

@router.delete("/sources/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
@router.delete("/references/sources/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_source(item_id: int, db: Session = Depends(get_db)):
    db_item = db.query(Source).filter(Source.id == item_id).first()
    if db_item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Источник не найден")
    
    db.delete(db_item)
    db.commit()
    logger.info(f"Удален источник с ID {item_id}")
    return None 