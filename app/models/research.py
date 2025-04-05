from sqlalchemy import Column, Integer, String, Text, Date, ForeignKey, Table
from sqlalchemy.orm import relationship
from app.database import Base

# Association tables for many-to-many relationships
research_region = Table(
    'research_region',
    Base.metadata,
    Column('research_id', Integer, ForeignKey('research.id')),
    Column('region_id', Integer, ForeignKey('region.id'))
)

research_organization = Table(
    'research_organization',
    Base.metadata,
    Column('research_id', Integer, ForeignKey('research.id')),
    Column('organization_id', Integer, ForeignKey('organization.id'))
)

research_person = Table(
    'research_person',
    Base.metadata,
    Column('research_id', Integer, ForeignKey('research.id')),
    Column('person_id', Integer, ForeignKey('person.id'))
)

research_direction = Table(
    'research_direction',
    Base.metadata,
    Column('research_id', Integer, ForeignKey('research.id')),
    Column('direction_id', Integer, ForeignKey('direction.id'))
)

# Добавляем таблицу связи для источников
research_source = Table(
    'research_source',
    Base.metadata,
    Column('research_id', Integer, ForeignKey('research.id')),
    Column('source_id', Integer, ForeignKey('source.id'))
)

class Research(Base):
    __tablename__ = "research"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(Text)
    technology_type_id = Column(Integer, ForeignKey("technology_type.id"))
    development_stage_id = Column(Integer, ForeignKey("development_stage.id"))
    start_date = Column(Date)
    source_link = Column(String)

    # Relationships
    technology_type = relationship("TechnologyType", back_populates="research")
    development_stage = relationship("DevelopmentStage", back_populates="research")
    regions = relationship("Region", secondary=research_region, back_populates="research")
    organizations = relationship("Organization", secondary=research_organization, back_populates="research")
    people = relationship("Person", secondary=research_person, back_populates="research")
    directions = relationship("Direction", secondary=research_direction, back_populates="research")
    # Добавляем связь с Source
    sources = relationship("Source", secondary=research_source, back_populates="research") 