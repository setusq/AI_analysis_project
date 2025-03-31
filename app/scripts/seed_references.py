import logging
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.db.models.references import (
    TechnologyType, DevelopmentStage, Region,
    Organization, Person, Direction, Source
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
        
        # Инициализация организаций
        organization_count = db.query(Organization).count()
        if organization_count == 0:
            logger.info("Инициализация таблицы 'Organization'...")
            organizations = [
                Organization(
                    name="Google", 
                    description="Американская транснациональная корпорация", 
                    region_id=1,
                    organization_type="Частная компания"
                ),
                Organization(
                    name="Microsoft", 
                    description="Американская транснациональная технологическая компания", 
                    region_id=1,
                    organization_type="Частная компания"
                ),
                Organization(
                    name="МФТИ", 
                    description="Московский физико-технический институт", 
                    region_id=3,
                    organization_type="Университет"
                ),
                Organization(
                    name="МГУ", 
                    description="Московский государственный университет имени М. В. Ломоносова", 
                    region_id=3,
                    organization_type="Университет"
                ),
                Organization(
                    name="ИТМО", 
                    description="Национальный исследовательский университет ИТМО", 
                    region_id=3,
                    organization_type="Университет"
                ),
                Organization(
                    name="КЦФПИ", 
                    description="Курчатовский центр функциональной предиктивной индустрии", 
                    region_id=3,
                    organization_type="Научно-исследовательский институт"
                ),
                Organization(
                    name="ВШЭ", 
                    description="Высшая школа экономики", 
                    region_id=3,
                    organization_type="Университет"
                ),
                Organization(
                    name="ФИЦ ИУ РАН", 
                    description="Федеральный исследовательский центр Информатика и управление РАН", 
                    region_id=3,
                    organization_type="Федеральное агентство"
                ),
                Organization(
                    name="МИСиС", 
                    description="Национальный исследовательский технологический университет МИСиС", 
                    region_id=3,
                    organization_type="Университет"
                ),
                Organization(
                    name="НИИСИ РАН", 
                    description="Научно-исследовательский институт системных исследований РАН", 
                    region_id=3,
                    organization_type="Научно-исследовательский институт"
                ),
            ]
            db.add_all(organizations)
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
            
        # Источники
        if db.query(Source).count() == 0:
            logger.info("Инициализация источников")
            sources = [
                {"name": "IEEE Spectrum", "description": "Журнал об инженерии и технологиях", "url": "https://spectrum.ieee.org/", "source_type": "Научный журнал"},
                {"name": "TechCrunch", "description": "Новостной портал о технологиях", "url": "https://techcrunch.com/", "source_type": "Новостной портал"},
                {"name": "Nature", "description": "Научный журнал", "url": "https://www.nature.com/", "source_type": "Научный журнал"},
                {"name": "Science", "description": "Научный журнал", "url": "https://www.science.org/", "source_type": "Научный журнал"},
                {"name": "MIT Technology Review", "description": "Журнал о технологиях", "url": "https://www.technologyreview.com/", "source_type": "Научный журнал"},
                {"name": "РАН", "description": "Российская академия наук", "url": "https://www.ras.ru/", "source_type": "Федеральный научный центр"},
                {"name": "НИЦ «Курчатовский институт»", "description": "Национальный исследовательский центр", "url": "https://www.nrcki.ru/", "source_type": "Федеральный научный центр"},
                {"name": "MIT", "description": "Массачусетский технологический институт", "url": "https://www.mit.edu/", "source_type": "Образовательное учреждение"},
                {"name": "Stanford University", "description": "Стэнфордский университет", "url": "https://www.stanford.edu/", "source_type": "Образовательное учреждение"},
                {"name": "arXiv", "description": "Архив электронных препринтов", "url": "https://arxiv.org/", "source_type": "Репозиторий научных работ"},
                {"name": "ResearchGate", "description": "Социальная сеть для ученых", "url": "https://www.researchgate.net/", "source_type": "Научная социальная сеть"},
                {"name": "IEEE Xplore", "description": "Цифровая библиотека IEEE", "url": "https://ieeexplore.ieee.org/", "source_type": "Научная электронная библиотека"},
                {"name": "Elsevier", "description": "Издательство научной литературы", "url": "https://www.elsevier.com/", "source_type": "Научное издательство"},
                {"name": "Springer", "description": "Издательство научной литературы", "url": "https://www.springer.com/", "source_type": "Научное издательство"}
            ]
            for source in sources:
                db.add(Source(**source))
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