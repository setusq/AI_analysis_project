import uvicorn
import logging
from app.db.base import Base
from app.db.session import engine
from app.scripts.seed_references import seed_references
import os

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)

logger = logging.getLogger(__name__)

def setup_database():
    """
    Создание таблиц базы данных и заполнение начальными данными
    """
    try:
        # Создаем все таблицы, определенные в моделях
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")
        
        # Заполняем справочники начальными данными
        seed_references()
        logger.info("Reference data initialized successfully")
    except Exception as e:
        logger.error(f"Error initializing database: {e}")
        raise

def main():
    """
    Основная функция запуска приложения
    """
    try:
        # Настройка и инициализация базы данных
        setup_database()
        
        # Определяем хост и порт для запуска приложения
        host = os.getenv("HOST", "0.0.0.0")
        port = int(os.getenv("PORT", "8000"))
        
        # Запуск FastAPI сервера
        logger.info(f"Starting server at {host}:{port}")
        uvicorn.run(
            "app.main:app",
            host=host,
            port=port,
            reload=True,
            log_level="info"
        )
    except Exception as e:
        logger.error(f"Error starting application: {e}")
        raise

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        logger.info("Application shutdown by user")
    except Exception as e:
        logger.error(f"Application error: {e}")
        raise 