from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.orm import relationship
from app.db.base import Base
from app.db.models.research import research_region, research_organization, research_person, research_direction

class TechnologyType(Base):
    __tablename__ = 'technology_type'
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)
    description = Column(Text, nullable=True)
    
    # Связь с исследованиями
    research = relationship("Research", back_populates="technology_type")

class DevelopmentStage(Base):
    __tablename__ = 'development_stage'
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)
    description = Column(Text, nullable=True)
    
    # Связь с исследованиями
    research = relationship("Research", back_populates="development_stage")

class Region(Base):
    __tablename__ = 'region'
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)
    description = Column(Text, nullable=True)
    
    # Связь с исследованиями
    research = relationship("Research", secondary=research_region, back_populates="regions")

class Organization(Base):
    __tablename__ = 'organization'
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)
    description = Column(Text, nullable=True)
    
    # Связь с исследованиями
    research = relationship("Research", secondary=research_organization, back_populates="organizations")

class Person(Base):
    __tablename__ = 'person'
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)
    description = Column(Text, nullable=True)
    
    # Связь с исследованиями
    research = relationship("Research", secondary=research_person, back_populates="people")

class Direction(Base):
    __tablename__ = 'direction'
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)
    description = Column(Text, nullable=True)
    
    # Связь с исследованиями
    research = relationship("Research", secondary=research_direction, back_populates="directions") 