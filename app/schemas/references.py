from pydantic import BaseModel, ConfigDict
from typing import Optional

class ReferenceBase(BaseModel):
    name: str
    description: Optional[str] = None
    code: Optional[str] = None

class ReferenceCreate(ReferenceBase):
    pass

class ReferenceUpdate(BaseModel):
    name: str
    description: Optional[str] = None
    code: Optional[str] = None

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

class OrganizationResponse(ReferenceResponse):
    pass

class PersonResponse(ReferenceResponse):
    pass

class DirectionResponse(ReferenceResponse):
    pass 