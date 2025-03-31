from pydantic import BaseModel, ConfigDict
from typing import Optional

class ReferenceBase(BaseModel):
    name: str
    description: Optional[str] = None
    code: Optional[str] = None

class ReferenceCreate(ReferenceBase):
    region_id: Optional[int] = None

class ReferenceUpdate(BaseModel):
    name: str
    description: Optional[str] = None
    code: Optional[str] = None
    region_id: Optional[int] = None

class ReferenceResponse(ReferenceBase):
    id: int
    
    model_config = ConfigDict(from_attributes=True)

# Специфические модели для каждого типа справочников
class TechnologyTypeResponse(ReferenceResponse):
    pass

class DevelopmentStageResponse(ReferenceResponse):
    pass

class RegionResponse(ReferenceResponse):
    pass

class OrganizationBase(ReferenceBase):
    """Базовая схема организации"""
    region_id: Optional[int] = None
    organization_type: Optional[str] = None

class OrganizationCreate(OrganizationBase):
    """Схема создания организации"""
    pass

class OrganizationUpdate(OrganizationBase):
    """Схема обновления организации"""
    pass

class OrganizationResponse(OrganizationBase):
    """Схема ответа для организации"""
    id: int
    region: Optional[RegionResponse] = None

    class Config:
        orm_mode = True

class PersonResponse(ReferenceResponse):
    pass

class DirectionResponse(ReferenceResponse):
    pass

# Модель для источников
class SourceBase(BaseModel):
    name: str
    description: Optional[str] = None
    url: Optional[str] = None
    source_type: Optional[str] = None

class SourceCreate(SourceBase):
    pass

class SourceUpdate(BaseModel):
    name: str
    description: Optional[str] = None
    url: Optional[str] = None
    source_type: Optional[str] = None

class SourceResponse(SourceBase):
    id: int
    
    model_config = ConfigDict(from_attributes=True) 