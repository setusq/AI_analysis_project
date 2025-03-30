from sqlalchemy import Column, String, Integer, ForeignKey, Numeric, Date
from sqlalchemy.orm import relationship
from app.db.base import BaseModel

class Region(BaseModel):
    __tablename__ = "regions"

    name = Column(String, nullable=False, unique=True)
    code = Column(String, unique=True)  # ISO country code
    research_developments = relationship("ResearchDevelopment", secondary="research_region", back_populates="regions")

class Organization(BaseModel):
    __tablename__ = "organizations"

    name = Column(String, nullable=False, unique=True)
    type = Column(String)  # company, university, research institute, etc.
    description = Column(String)
    website = Column(String)
    research_developments = relationship("ResearchDevelopment", secondary="research_organization", back_populates="organizations")

class Person(BaseModel):
    __tablename__ = "people"

    name = Column(String, nullable=False)
    role = Column(String)
    organization_id = Column(Integer, ForeignKey("organizations.id"))
    organization = relationship("Organization")
    research_developments = relationship("ResearchDevelopment", secondary="research_person", back_populates="people")

class Direction(BaseModel):
    __tablename__ = "directions"

    name = Column(String, nullable=False, unique=True)
    description = Column(String)
    research_developments = relationship("ResearchDevelopment", secondary="research_direction", back_populates="directions")

class Funding(BaseModel):
    __tablename__ = "funding"

    research_development_id = Column(Integer, ForeignKey("research_developments.id"))
    amount = Column(Numeric)
    currency = Column(String)
    source = Column(String)  # government, private, etc.
    date = Column(Date)
    research_development = relationship("ResearchDevelopment", back_populates="funding") 