from sqlalchemy import Column, String, Date, ForeignKey, Table
from sqlalchemy.orm import relationship
from app.db.base import BaseModel

# Association tables for many-to-many relationships
research_region = Table(
    'research_region',
    BaseModel.metadata,
    Column('research_id', Integer, ForeignKey('research_developments.id')),
    Column('region_id', Integer, ForeignKey('regions.id'))
)

research_organization = Table(
    'research_organization',
    BaseModel.metadata,
    Column('research_id', Integer, ForeignKey('research_developments.id')),
    Column('organization_id', Integer, ForeignKey('organizations.id'))
)

research_person = Table(
    'research_person',
    BaseModel.metadata,
    Column('research_id', Integer, ForeignKey('research_developments.id')),
    Column('person_id', Integer, ForeignKey('people.id'))
)

research_direction = Table(
    'research_direction',
    BaseModel.metadata,
    Column('research_id', Integer, ForeignKey('research_developments.id')),
    Column('direction_id', Integer, ForeignKey('directions.id'))
)

class ResearchDevelopment(BaseModel):
    __tablename__ = "research_developments"

    name = Column(String, nullable=False)
    description = Column(String)
    technology_type = Column(String, nullable=False)
    development_stage = Column(String, nullable=False)
    start_date = Column(Date)
    source_link = Column(String)
    
    # Relationships
    regions = relationship("Region", secondary=research_region, back_populates="research_developments")
    organizations = relationship("Organization", secondary=research_organization, back_populates="research_developments")
    people = relationship("Person", secondary=research_person, back_populates="research_developments")
    directions = relationship("Direction", secondary=research_direction, back_populates="research_developments")
    funding = relationship("Funding", back_populates="research_development") 