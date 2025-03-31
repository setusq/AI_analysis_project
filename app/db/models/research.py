from sqlalchemy import Column, Integer, String, Text, Date, ForeignKey, Table
from sqlalchemy.orm import relationship
from app.db.base import Base

# Таблицы связей для многие-ко-многим
# Убираем таблицу research_region
# research_region = Table(
#     'research_region',
#     Base.metadata,
#     Column('research_id', Integer, ForeignKey('research.id')),
#     Column('region_id', Integer, ForeignKey('region.id'))
# )

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

research_source = Table(
    'research_source',
    Base.metadata,
    Column('research_id', Integer, ForeignKey('research.id')),
    Column('source_id', Integer, ForeignKey('source.id'))
)

class Research(Base):
    __tablename__ = 'research'
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    start_date = Column(Date, nullable=False)
    source_link = Column(String(255), nullable=False)  # Возвращаем поле source_link для детальной ссылки
    
    # Внешние ключи для связей один-ко-многим
    technology_type_id = Column(Integer, ForeignKey('technology_type.id'), nullable=False)
    development_stage_id = Column(Integer, ForeignKey('development_stage.id'), nullable=False)
    
    # Связи один-ко-многим
    technology_type = relationship("TechnologyType", back_populates="research")
    development_stage = relationship("DevelopmentStage", back_populates="research")
    
    # Связи многие-ко-многим
    # Удаляем связь с регионами
    # regions = relationship("Region", secondary=research_region, back_populates="research")
    organizations = relationship("Organization", secondary=research_organization, back_populates="research")
    people = relationship("Person", secondary=research_person, back_populates="research")
    directions = relationship("Direction", secondary=research_direction, back_populates="research")
    sources = relationship("Source", secondary=research_source, backref="research") 