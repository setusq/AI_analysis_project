from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os
import logging

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./ai_research.db")

logger = logging.getLogger(__name__)

# Создание движка базы данных
engine = create_engine(DATABASE_URL)

# Создание фабрики сессий
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Базовый класс для моделей
Base = declarative_base()

# Функция для получения сессии базы данных
def get_db():
    db = SessionLocal()
    try:
        logger.info("Database session initialized successfully")
        yield db
    finally:
        db.close()
        
# Функция для создания таблиц
def create_tables():
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"Error creating database tables: {str(e)}")
        raise

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() 