from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.database import Base

class TechnologyType(Base):
    __tablename__ = "technology_type"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)

    research = relationship("Research", back_populates="technology_type")

class DevelopmentStage(Base):
    __tablename__ = "development_stage"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)

    research = relationship("Research", back_populates="development_stage")

class Region(Base):
    __tablename__ = "region"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    code = Column(String, unique=True)

    research = relationship("Research", secondary="research_region", back_populates="regions")

class Organization(Base):
    __tablename__ = "organization"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)

    research = relationship("Research", secondary="research_organization", back_populates="organizations")

class Person(Base):
    __tablename__ = "person"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)

    research = relationship("Research", secondary="research_person", back_populates="people")

class Direction(Base):
    __tablename__ = "direction"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)

    research = relationship("Research", secondary="research_direction", back_populates="directions")

class Source(Base):
    __tablename__ = "source"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    description = Column(String, nullable=True)
    url = Column(String, nullable=True) 