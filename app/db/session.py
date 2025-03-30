import logging
import os
from sqlalchemy import create_engine, event
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import SQLAlchemyError

logger = logging.getLogger(__name__)

# Используем SQLite вместо PostgreSQL для простоты тестирования
DATABASE_URL = "sqlite:///./ai_research.db"

try:
    # Создаем директорию для базы данных, если её нет
    db_dir = os.path.dirname(DATABASE_URL.replace("sqlite:///", ""))
    if db_dir and not os.path.exists(db_dir):
        os.makedirs(db_dir)
    
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},  # Необходимо для SQLite
        pool_pre_ping=True,
        echo=False
    )
    
    # Логирование подключения к БД
    @event.listens_for(engine, "connect")
    def connect(dbapi_connection, connection_record):
        logger.info("Database connection established")
    
    # Логирование отключения от БД
    @event.listens_for(engine, "close")
    def close(dbapi_connection, connection_record):
        logger.info("Database connection closed")
    
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    logger.info("Database session initialized successfully")
    
except SQLAlchemyError as e:
    logger.error(f"Error connecting to database: {e}")
    raise

def get_db():
    """
    Зависимость для получения сессии базы данных.
    Используется с FastAPI Depends для автоматического управления сессиями.
    """
    db = SessionLocal()
    try:
        yield db
    except SQLAlchemyError as e:
        logger.error(f"Database error occurred: {e}")
        db.rollback()
        raise
    finally:
        db.close() 