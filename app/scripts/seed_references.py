import logging
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.db.models.references import (
    TechnologyType, DevelopmentStage, Region,
    Organization, Person, Direction
)

logger = logging.getLogger(__name__)

def seed_references():
    """
    Инициализация справочников начальными данными, если они пусты
    """
    db = SessionLocal()
    try:
        # Типы технологий
        if db.query(TechnologyType).count() == 0:
            logger.info("Инициализация типов технологий")
            technology_types = [
                {"name": "Искусственный интеллект", "description": "Имитация человеческого интеллекта машинами"},
                {"name": "Машинное обучение", "description": "Системы, которые учатся на данных без явного программирования"},
                {"name": "Глубокое обучение", "description": "Многослойные нейронные сети"},
                {"name": "Обработка естественного языка", "description": "Технологии для работы с текстом"},
                {"name": "Компьютерное зрение", "description": "Технологии для анализа и обработки изображений"}
            ]
            for tech_type in technology_types:
                db.add(TechnologyType(**tech_type))
            db.commit()
        
        # Этапы разработки
        if db.query(DevelopmentStage).count() == 0:
            logger.info("Инициализация этапов разработки")
            stages = [
                {"name": "Исследование", "description": "Начальный этап изучения технологии"},
                {"name": "Разработка", "description": "Этап создания прототипов"},
                {"name": "Тестирование", "description": "Этап проверки работоспособности"},
                {"name": "Внедрение", "description": "Этап практического применения"},
                {"name": "Поддержка", "description": "Этап сопровождения технологии"}
            ]
            for stage in stages:
                db.add(DevelopmentStage(**stage))
            db.commit()
        
        # Регионы
        if db.query(Region).count() == 0:
            logger.info("Инициализация регионов")
            regions = [
                {"name": "Северная Америка", "description": "США, Канада, Мексика"},
                {"name": "Европа", "description": "Страны Европейского союза, Великобритания, Норвегия, Швейцария"},
                {"name": "Азия", "description": "Китай, Япония, Южная Корея, Индия"},
                {"name": "Африка", "description": "Страны африканского континента"},
                {"name": "Южная Америка", "description": "Бразилия, Аргентина, Чили"},
                {"name": "Австралия и Океания", "description": "Австралия, Новая Зеландия, острова Тихого океана"}
            ]
            for region in regions:
                db.add(Region(**region))
            db.commit()
        
        # Организации
        if db.query(Organization).count() == 0:
            logger.info("Инициализация организаций")
            organizations = [
                {"name": "Google", "description": "Американская технологическая компания"},
                {"name": "Microsoft", "description": "Американская технологическая компания"},
                {"name": "Apple", "description": "Американская технологическая компания"},
                {"name": "Amazon", "description": "Американская технологическая компания"},
                {"name": "Facebook", "description": "Американская компания социальных медиа"},
                {"name": "IBM", "description": "Американская технологическая компания"},
                {"name": "Intel", "description": "Американский производитель полупроводников"},
                {"name": "NVIDIA", "description": "Американский производитель графических процессоров"}
            ]
            for org in organizations:
                db.add(Organization(**org))
            db.commit()
        
        # Люди
        if db.query(Person).count() == 0:
            logger.info("Инициализация списка людей")
            people = [
                {"name": "Илон Маск", "description": "CEO Tesla и SpaceX"},
                {"name": "Сатья Наделла", "description": "CEO Microsoft"},
                {"name": "Сундар Пичаи", "description": "CEO Google"},
                {"name": "Тим Кук", "description": "CEO Apple"},
                {"name": "Марк Цукерберг", "description": "CEO Meta"},
                {"name": "Дженсен Хуанг", "description": "CEO NVIDIA"}
            ]
            for person in people:
                db.add(Person(**person))
            db.commit()
        
        # Направления
        if db.query(Direction).count() == 0:
            logger.info("Инициализация направлений")
            directions = [
                {"name": "Здравоохранение", "description": "Применение технологий в медицине"},
                {"name": "Финансы", "description": "Применение технологий в финансовом секторе"},
                {"name": "Образование", "description": "Применение технологий в обучении"},
                {"name": "Транспорт", "description": "Применение технологий в транспортной сфере"},
                {"name": "Производство", "description": "Применение технологий в промышленности"},
                {"name": "Retail", "description": "Применение технологий в розничной торговле"},
                {"name": "Энергетика", "description": "Применение технологий в энергетическом секторе"}
            ]
            for direction in directions:
                db.add(Direction(**direction))
            db.commit()
        
        logger.info("Инициализация справочных данных завершена успешно")
    except Exception as e:
        logger.error(f"Ошибка при инициализации справочных данных: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_references() 