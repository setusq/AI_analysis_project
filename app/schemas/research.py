from typing import List, Optional
from pydantic import BaseModel, ConfigDict
from datetime import date
from app.schemas.references import (
    TechnologyTypeResponse, DevelopmentStageResponse, RegionResponse,
    OrganizationResponse, PersonResponse, DirectionResponse, SourceResponse
)

class ResearchBase(BaseModel):
    name: str
    description: str
    technology_type_id: int
    development_stage_id: int
    start_date: date
    source_link: str  # Детальная ссылка на источник

class ResearchCreate(ResearchBase):
    organization_ids: List[int] = []
    person_ids: List[int] = []
    direction_ids: List[int] = []
    source_ids: List[int] = []  # Список ID источников

class ResearchUpdate(ResearchBase):
    organization_ids: Optional[List[int]] = []
    person_ids: Optional[List[int]] = []
    direction_ids: Optional[List[int]] = []
    source_ids: Optional[List[int]] = []  # Список ID источников

class ResearchResponse(BaseModel):
    id: int
    name: str
    description: str
    technology_type_id: int
    development_stage_id: int
    start_date: date
    source_link: str  # Детальная ссылка на источник
    
    # Объекты связанных сущностей
    technology_type: Optional[TechnologyTypeResponse] = None
    development_stage: Optional[DevelopmentStageResponse] = None
    organizations: List[OrganizationResponse] = []
    people: List[PersonResponse] = []
    directions: List[DirectionResponse] = []
    sources: List[SourceResponse] = []  # Список источников вместо одного source

    model_config = ConfigDict(from_attributes=True)

class ResearchFilter(BaseModel):
    name: Optional[str] = None
    technology_type_id: Optional[int] = None
    development_stage_id: Optional[int] = None
    organization_id: Optional[int] = None
    person_id: Optional[int] = None
    direction_id: Optional[int] = None
    source_id: Optional[int] = None 