from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional, Dict
import logging
from app.db.session import get_db
from app.schemas.research import ResearchCreate, ResearchResponse, ResearchFilter, ResearchUpdate
from app.db.models.research import Research
from app.db.models.references import TechnologyType, DevelopmentStage, Organization, Person, Direction, Source, Region
from sqlalchemy import func
import io
import csv
from datetime import datetime
from fastapi.responses import StreamingResponse
from fastapi.responses import Response

router = APIRouter(prefix="/api")
logger = logging.getLogger(__name__)

@router.post("/research/", response_model=ResearchResponse)
def create_research(research: ResearchCreate, db: Session = Depends(get_db)):
    try:
        # Создаем новое исследование
        db_research = Research(
            name=research.name,
            description=research.description,
            technology_type_id=research.technology_type_id,
            development_stage_id=research.development_stage_id,
            start_date=research.start_date,
            source_link=research.source_link  # Используем source_link вместо source_id
        )
        
        db.add(db_research)
        db.commit()
        db.refresh(db_research)
        
        # Добавляем связи с организациями
        if research.organization_ids and len(research.organization_ids) > 0:
            organizations = db.query(Organization).filter(Organization.id.in_(research.organization_ids)).all()
            db_research.organizations = organizations
        
        # Добавляем связи с людьми
        if research.person_ids and len(research.person_ids) > 0:
            people = db.query(Person).filter(Person.id.in_(research.person_ids)).all()
            db_research.people = people
        
        # Добавляем связи с направлениями
        if research.direction_ids and len(research.direction_ids) > 0:
            directions = db.query(Direction).filter(Direction.id.in_(research.direction_ids)).all()
            db_research.directions = directions
            
        # Добавляем связи с источниками
        if research.source_ids and len(research.source_ids) > 0:
            sources = db.query(Source).filter(Source.id.in_(research.source_ids)).all()
            db_research.sources = sources
        
        db.commit()
        db.refresh(db_research)
        
        logger.info(f"Создано новое исследование: {db_research.name}")
        return db_research
    except Exception as e:
        db.rollback()
        logger.error(f"Ошибка при создании исследования: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при создании исследования: {str(e)}"
        )

@router.put("/research/{research_id}", response_model=ResearchResponse)
def update_research(research_id: int, research: ResearchUpdate, db: Session = Depends(get_db)):
    try:
        # Получаем существующее исследование
        db_research = db.query(Research).filter(Research.id == research_id).first()
        if not db_research:
            raise HTTPException(status_code=404, detail="Исследование не найдено")
        
        # Обновляем основные поля
        db_research.name = research.name
        db_research.description = research.description
        db_research.technology_type_id = research.technology_type_id
        db_research.development_stage_id = research.development_stage_id
        db_research.start_date = research.start_date
        db_research.source_link = research.source_link  # Используем source_link вместо source_id
        
        # Обновляем связи с организациями
        if research.organization_ids is not None:
            organizations = db.query(Organization).filter(Organization.id.in_(research.organization_ids)).all()
            db_research.organizations = organizations
        
        # Обновляем связи с людьми
        if research.person_ids is not None:
            people = db.query(Person).filter(Person.id.in_(research.person_ids)).all()
            db_research.people = people
        
        # Обновляем связи с направлениями
        if research.direction_ids is not None:
            directions = db.query(Direction).filter(Direction.id.in_(research.direction_ids)).all()
            db_research.directions = directions
            
        # Обновляем связи с источниками
        if research.source_ids is not None:
            sources = db.query(Source).filter(Source.id.in_(research.source_ids)).all()
            db_research.sources = sources
        
        db.commit()
        db.refresh(db_research)
        
        logger.info(f"Обновлено исследование с ID {research_id}: {db_research.name}")
        return db_research
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Ошибка при обновлении исследования: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при обновлении исследования: {str(e)}"
        )

@router.get("/research/", response_model=List[ResearchResponse])
def get_research_list(
    name: Optional[str] = None,
    technology_type_id: Optional[int] = None,
    development_stage_id: Optional[int] = None,
    organization_id: Optional[int] = None,
    person_id: Optional[int] = None,
    direction_id: Optional[int] = None,
    source_id: Optional[int] = None,  # Добавляем фильтр по источнику
    db: Session = Depends(get_db)
):
    try:
        query = db.query(Research)
        
        # Применяем фильтры, если они переданы
        if name:
            query = query.filter(Research.name.ilike(f"%{name}%"))
            
        if technology_type_id:
            query = query.filter(Research.technology_type_id == technology_type_id)
            
        if development_stage_id:
            query = query.filter(Research.development_stage_id == development_stage_id)
            
        if organization_id:
            query = query.join(Research.organizations).filter(Organization.id == organization_id)
            
        if person_id:
            query = query.join(Research.people).filter(Person.id == person_id)
            
        if direction_id:
            query = query.join(Research.directions).filter(Direction.id == direction_id)
            
        if source_id:
            query = query.filter(Research.source_id == source_id)
        
        research_list = query.all()
        logger.info(f"Запрошен список исследований. Найдено: {len(research_list)} записей")
        return research_list
    except Exception as e:
        logger.error(f"Ошибка при получении списка исследований: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при получении списка исследований: {str(e)}"
        )

@router.get("/research/export-csv-template")
def export_csv_template():
    """
    Возвращает шаблон CSV файла для импорта исследований
    """
    try:
        # Создаем содержимое CSV файла
        csv_content = "name,description,technology_type,development_stage,start_date,source_link,organizations,people,directions,sources\n"
        csv_content += "Название исследования,Описание исследования,Искусственный интеллект,Прототип,01.01.2023,https://example.com/research,\"Google, Microsoft\",\"Илон Маск, Сатья Наделла\",\"Здравоохранение, Образование\",\"IEEE Spectrum, Nature\""
        
        # Возвращаем CSV как простой текст
        return Response(
            content=csv_content,
            media_type="text/csv",
            headers={
                "Content-Disposition": "attachment; filename=research_template.csv"
            }
        )
    except Exception as e:
        logger.error(f"Ошибка при экспорте шаблона CSV: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при экспорте шаблона CSV: {str(e)}"
        )

@router.post("/research/import-csv")
async def import_research_from_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    try:
        logger.info(f"Получен файл для импорта: {file.filename}, размер: {file.size}, content_type: {file.content_type}")
        
        contents = await file.read()
        logger.info(f"Прочитано {len(contents)} байт из файла")
        
        # Пробуем декодировать с разными кодировками
        try:
            decoded_contents = contents.decode('utf-8-sig')
            logger.info("Файл успешно декодирован как utf-8-sig")
        except UnicodeDecodeError:
            try:
                decoded_contents = contents.decode('utf-8')
                logger.info("Файл успешно декодирован как utf-8")
            except UnicodeDecodeError:
                try:
                    decoded_contents = contents.decode('cp1251')
                    logger.info("Файл успешно декодирован как cp1251")
                except UnicodeDecodeError:
                    logger.error("Не удалось декодировать файл ни в одной из кодировок")
                    raise ValueError("Не удалось декодировать файл. Убедитесь, что файл в формате CSV с кодировкой UTF-8 или CP1251")
        
        # Проверяем первые несколько символов для отладки
        logger.info(f"Первые 100 символов файла: {decoded_contents[:100]}")
        
        # Пробуем разные диалекты CSV
        try:
            csv_reader = csv.DictReader(io.StringIO(decoded_contents), delimiter=',')
            # Проверяем заголовки
            fieldnames = csv_reader.fieldnames
            if not fieldnames:
                raise ValueError("Не удалось определить заголовки CSV")
            
            logger.info(f"Заголовки CSV: {fieldnames}")
            
            # Проверяем обязательные поля
            required_fields = ['name', 'description']
            missing_fields = [field for field in required_fields if field not in fieldnames]
            if missing_fields:
                raise ValueError(f"В CSV файле отсутствуют обязательные поля: {', '.join(missing_fields)}")
            
            results = {
                "success": 0,
                "errors": [],
                "new_refs": {
                    "organizations": [],
                    "people": [],
                    "directions": [],
                    "sources": []
                }
            }
            
            for idx, row in enumerate(csv_reader, 1):
                try:
                    logger.info(f"Обработка строки {idx}: {row}")
                    
                    # Проверка обязательных полей
                    if not row.get('name'):
                        raise ValueError("Отсутствует название исследования")
                    
                    # Обработка технологии - проверка наличия или создание новой
                    tech_type = None
                    if row.get('technology_type'):
                        tech_type = db.query(TechnologyType).filter(TechnologyType.name == row['technology_type']).first()
                        if not tech_type:
                            tech_type = TechnologyType(name=row['technology_type'])
                            db.add(tech_type)
                            db.flush()
                            logger.info(f"Создан новый тип технологии: {row['technology_type']}")
                    
                    # Обработка этапа разработки - проверка наличия или создание нового
                    dev_stage = None
                    if row.get('development_stage'):
                        dev_stage = db.query(DevelopmentStage).filter(DevelopmentStage.name == row['development_stage']).first()
                        if not dev_stage:
                            dev_stage = DevelopmentStage(name=row['development_stage'])
                            db.add(dev_stage)
                            db.flush()
                            logger.info(f"Создан новый этап разработки: {row['development_stage']}")
                    
                    # Обработка даты
                    start_date = None
                    if row.get('start_date'):
                        try:
                            # Пробуем несколько форматов даты
                            date_formats = ['%d.%m.%Y', '%Y-%m-%d']
                            for date_format in date_formats:
                                try:
                                    start_date = datetime.strptime(row['start_date'], date_format).date()
                                    logger.info(f"Успешно распарсена дата: {row['start_date']} -> {start_date}")
                                    break
                                except ValueError:
                                    continue
                            
                            if not start_date:
                                raise ValueError(f"Неверный формат даты. Ожидается ДД.ММ.ГГГГ или ГГГГ-ММ-ДД")
                        except Exception as e:
                            raise ValueError(f"Ошибка в формате даты: {str(e)}")
                    
                    # Создаем исследование
                    research = Research(
                        name=row.get('name', ''),
                        description=row.get('description', ''),
                        technology_type_id=tech_type.id if tech_type else None,
                        development_stage_id=dev_stage.id if dev_stage else None,
                        start_date=start_date,
                        source_link=row.get('source_link', '')
                    )
                    
                    db.add(research)
                    db.flush()
                    logger.info(f"Создано новое исследование с ID {research.id}, name={research.name}")
                    
                    # Обработка организаций
                    if row.get('organizations'):
                        organizations = [org.strip() for org in row['organizations'].split(',') if org.strip()]
                        logger.info(f"Список организаций для добавления: {organizations}")
                        for org_name in organizations:
                            organization = db.query(Organization).filter(Organization.name == org_name).first()
                            if not organization:
                                organization = Organization(name=org_name)
                                db.add(organization)
                                db.flush()
                                results["new_refs"]["organizations"].append(org_name)
                                logger.info(f"Создана новая организация: {org_name}")
                            
                            research.organizations.append(organization)
                    
                    # Обработка людей
                    if row.get('people'):
                        people = [person.strip() for person in row['people'].split(',') if person.strip()]
                        logger.info(f"Список людей для добавления: {people}")
                        for person_name in people:
                            person = db.query(Person).filter(Person.name == person_name).first()
                            if not person:
                                person = Person(name=person_name)
                                db.add(person)
                                db.flush()
                                results["new_refs"]["people"].append(person_name)
                                logger.info(f"Создан новый человек: {person_name}")
                            
                            research.people.append(person)
                    
                    # Обработка направлений
                    if row.get('directions'):
                        directions = [direction.strip() for direction in row['directions'].split(',') if direction.strip()]
                        logger.info(f"Список направлений для добавления: {directions}")
                        for direction_name in directions:
                            direction = db.query(Direction).filter(Direction.name == direction_name).first()
                            if not direction:
                                direction = Direction(name=direction_name)
                                db.add(direction)
                                db.flush()
                                results["new_refs"]["directions"].append(direction_name)
                                logger.info(f"Создано новое направление: {direction_name}")
                            
                            research.directions.append(direction)
                    
                    # Обработка источников
                    if row.get('sources'):
                        sources = [source.strip() for source in row['sources'].split(',') if source.strip()]
                        logger.info(f"Список источников для добавления: {sources}")
                        for source_name in sources:
                            source = db.query(Source).filter(Source.name == source_name).first()
                            if not source:
                                source = Source(name=source_name)
                                db.add(source)
                                db.flush()
                                results["new_refs"]["sources"].append(source_name)
                                logger.info(f"Создан новый источник: {source_name}")
                            
                            research.sources.append(source)
                    
                    results["success"] += 1
                    
                except Exception as e:
                    db.rollback()  # Откатываем транзакцию для текущей строки при ошибке
                    row_str = ", ".join([f"{k}: {v}" for k, v in row.items()])
                    error_msg = f"Ошибка в строке {idx}: {row_str}. Причина: {str(e)}"
                    logger.error(error_msg)
                    results["errors"].append(error_msg)
                    # Продолжаем обработку следующей строки
            
            # Если были успешные импорты, коммитим транзакцию
            if results["success"] > 0:
                db.commit()
                logger.info(f"Импорт завершен. Успешно импортировано: {results['success']} записей")
            
            return results
            
        except Exception as csv_error:
            logger.error(f"Ошибка при обработке CSV: {str(csv_error)}")
            raise ValueError(f"Ошибка при обработке CSV файла: {str(csv_error)}")
            
    except Exception as e:
        db.rollback()
        logger.error(f"Ошибка при импорте исследований из CSV: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при импорте исследований из CSV: {str(e)}"
        )

@router.get("/research/export-results-csv")
def export_research_results_csv(
    name: Optional[str] = None,
    technology_type_id: Optional[int] = None,
    development_stage_id: Optional[int] = None,
    organization_id: Optional[int] = None,
    person_id: Optional[int] = None,
    direction_id: Optional[int] = None,
    source_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """
    Экспортирует отфильтрованные результаты в CSV
    """
    try:
        # Используем ту же логику фильтрации, что и в get_research_list
        query = db.query(Research)
        
        # Применяем фильтры, если они переданы
        if name:
            query = query.filter(Research.name.ilike(f"%{name}%"))
            
        if technology_type_id:
            query = query.filter(Research.technology_type_id == technology_type_id)
            
        if development_stage_id:
            query = query.filter(Research.development_stage_id == development_stage_id)
            
        if organization_id:
            query = query.join(Research.organizations).filter(Organization.id == organization_id)
            
        if person_id:
            query = query.join(Research.people).filter(Person.id == person_id)
            
        if direction_id:
            query = query.join(Research.directions).filter(Direction.id == direction_id)
            
        if source_id:
            query = query.join(Research.sources).filter(Source.id == source_id)
        
        research_list = query.all()
        logger.info(f"Запрошен экспорт в CSV. Найдено: {len(research_list)} записей")
        
        # Создаем CSV из результатов
        csv_output = io.StringIO()
        writer = csv.writer(csv_output)
        
        # Записываем заголовки
        headers = [
            "Название", "Описание", "Тип технологии", "Этап разработки", 
            "Дата начала", "Источник", "Организации", "Люди", 
            "Направления", "Источники"
        ]
        writer.writerow(headers)
        
        # Записываем данные
        for research in research_list:
            # Получаем связанные данные
            technology_type = research.technology_type.name if research.technology_type else ""
            development_stage = research.development_stage.name if research.development_stage else ""
            
            organizations = ", ".join([org.name for org in research.organizations]) if research.organizations else ""
            people = ", ".join([person.name for person in research.people]) if research.people else ""
            directions = ", ".join([direction.name for direction in research.directions]) if research.directions else ""
            sources = ", ".join([source.name for source in research.sources]) if research.sources else ""
            
            # Форматируем дату
            start_date = research.start_date.strftime("%d.%m.%Y") if research.start_date else ""
            
            # Записываем строку
            row = [
                research.name,
                research.description,
                technology_type,
                development_stage,
                start_date,
                research.source_link,
                organizations,
                people,
                directions,
                sources
            ]
            writer.writerow(row)
        
        # Подготавливаем ответ
        csv_output.seek(0)
        content = csv_output.getvalue()
        
        # Определяем имя файла с учетом фильтров
        filename = "research_results"
        if name:
            filename += f"_search_{name}"
        filename += ".csv"
        
        # Возвращаем CSV как ответ
        return Response(
            content=content,
            media_type="text/csv",
            headers={
                "Content-Disposition": f"attachment; filename={filename}"
            }
        )
    except Exception as e:
        logger.error(f"Ошибка при экспорте результатов в CSV: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при экспорте результатов в CSV: {str(e)}"
        )

@router.get("/research/stats/by-region")
def get_research_by_region_stats(
    regions: Optional[str] = None,
    tech_types: Optional[str] = None,
    stages: Optional[str] = None,
    directions: Optional[str] = None,
    db: Session = Depends(get_db)
):
    try:
        # Создаем базовый запрос
        query = db.query(
            Region.name.label("region_name"),
            func.count(Research.id.distinct()).label("research_count")
        ).join(
            Organization, Region.id == Organization.region_id, isouter=True
        ).join(
            Organization.research, isouter=True
        )
        
        # Применяем фильтры
        if tech_types:
            tech_type_list = tech_types.split(',')
            query = query.join(
                TechnologyType, Research.technology_type_id == TechnologyType.id, isouter=True
            ).filter(TechnologyType.name.in_(tech_type_list))
            
        if stages:
            stage_list = stages.split(',')
            query = query.join(
                DevelopmentStage, Research.development_stage_id == DevelopmentStage.id, isouter=True
            ).filter(DevelopmentStage.name.in_(stage_list))
            
        if directions:
            direction_list = directions.split(',')
            query = query.join(
                Research.directions, isouter=True
            ).filter(Direction.name.in_(direction_list))
        
        # Если указаны регионы, фильтруем результат только по указанным регионам
        if regions:
            region_list = regions.split(',')
            query = query.filter(Region.name.in_(region_list))
        
        # Группируем и получаем результат
        try:
            stats = query.group_by(Region.name).all()
            
            # Преобразуем результат в словарь
            result = [{"region": item.region_name, "count": item.research_count} for item in stats]
            
            logger.info(f"Запрошена статистика исследований по регионам. Найдено: {len(result)} записей")
            return result
        except Exception as query_error:
            logger.error(f"Ошибка выполнения запроса статистики по регионам: {str(query_error)}")
            # Возвращаем пустой список вместо ошибки, чтобы не блокировать работу интерфейса
            return []
    except Exception as e:
        logger.error(f"Ошибка при получении статистики по регионам: {str(e)}")
        # Возвращаем пустой список вместо ошибки, чтобы не блокировать работу интерфейса
        return []

@router.get("/research/stats/by-tech-type")
def get_research_by_tech_type_stats(
    regions: Optional[str] = None,
    tech_types: Optional[str] = None,
    stages: Optional[str] = None,
    directions: Optional[str] = None,
    db: Session = Depends(get_db)
):
    try:
        # Создаем базовый запрос
        query = db.query(
            TechnologyType.name.label("tech_type_name"),
            func.count(Research.id.distinct()).label("research_count")
        ).join(
            Research, Research.technology_type_id == TechnologyType.id, isouter=True
        )
        
        # Применяем фильтры
        if regions:
            region_list = regions.split(',')
            query = query.join(
                Research.organizations, isouter=True
            ).join(
                Organization.region, isouter=True
            ).filter(Region.name.in_(region_list))
            
        if stages:
            stage_list = stages.split(',')
            query = query.join(
                DevelopmentStage, Research.development_stage_id == DevelopmentStage.id, isouter=True
            ).filter(DevelopmentStage.name.in_(stage_list))
            
        if directions:
            direction_list = directions.split(',')
            query = query.join(
                Research.directions, isouter=True
            ).filter(Direction.name.in_(direction_list))
        
        # Если указаны типы технологий, фильтруем результат только по указанным типам
        if tech_types:
            tech_type_list = tech_types.split(',')
            query = query.filter(TechnologyType.name.in_(tech_type_list))
        
        # Группируем и получаем результат
        try:
            stats = query.group_by(TechnologyType.name).all()
            
            # Преобразуем результат в словарь
            result = [{"tech_type": item.tech_type_name, "count": item.research_count} for item in stats]
            
            logger.info(f"Запрошена статистика исследований по типам технологий. Найдено: {len(result)} записей")
            return result
        except Exception as query_error:
            logger.error(f"Ошибка выполнения запроса статистики по типам технологий: {str(query_error)}")
            # Возвращаем пустой список вместо ошибки
            return []
    except Exception as e:
        logger.error(f"Ошибка при получении статистики по типам технологий: {str(e)}")
        # Возвращаем пустой список вместо ошибки
        return []

@router.get("/research/stats/by-stage")
def get_research_by_stage_stats(
    regions: Optional[str] = None,
    tech_types: Optional[str] = None,
    stages: Optional[str] = None,
    directions: Optional[str] = None,
    db: Session = Depends(get_db)
):
    try:
        # Создаем базовый запрос
        query = db.query(
            DevelopmentStage.name.label("stage_name"),
            func.count(Research.id.distinct()).label("research_count")
        ).join(
            Research, Research.development_stage_id == DevelopmentStage.id, isouter=True
        )
        
        # Применяем фильтры
        if regions:
            region_list = regions.split(',')
            query = query.join(
                Research.organizations, isouter=True
            ).join(
                Organization.region, isouter=True
            ).filter(Region.name.in_(region_list))
            
        if tech_types:
            tech_type_list = tech_types.split(',')
            query = query.join(
                TechnologyType, Research.technology_type_id == TechnologyType.id, isouter=True
            ).filter(TechnologyType.name.in_(tech_type_list))
            
        if directions:
            direction_list = directions.split(',')
            query = query.join(
                Research.directions, isouter=True
            ).filter(Direction.name.in_(direction_list))
        
        # Если указаны этапы разработки, фильтруем результат только по указанным этапам
        if stages:
            stage_list = stages.split(',')
            query = query.filter(DevelopmentStage.name.in_(stage_list))
        
        # Группируем и получаем результат
        try:
            stats = query.group_by(DevelopmentStage.name).all()
            
            # Преобразуем результат в словарь
            result = [{"stage": item.stage_name, "count": item.research_count} for item in stats]
            
            logger.info(f"Запрошена статистика исследований по этапам разработки. Найдено: {len(result)} записей")
            return result
        except Exception as query_error:
            logger.error(f"Ошибка выполнения запроса статистики по этапам разработки: {str(query_error)}")
            # Возвращаем пустой список вместо ошибки
            return []
    except Exception as e:
        logger.error(f"Ошибка при получении статистики по этапам разработки: {str(e)}")
        # Возвращаем пустой список вместо ошибки
        return []

@router.get("/research/stats/by-direction")
def get_research_by_direction_stats(
    regions: Optional[str] = None,
    tech_types: Optional[str] = None,
    stages: Optional[str] = None,
    directions: Optional[str] = None,
    db: Session = Depends(get_db)
):
    try:
        # Создаем базовый запрос
        query = db.query(
            Direction.name.label("direction_name"),
            func.count(Research.id.distinct()).label("research_count")
        ).join(
            Direction.research, isouter=True
        )
        
        # Применяем фильтры
        if regions:
            region_list = regions.split(',')
            query = query.join(
                Research.organizations, isouter=True
            ).join(
                Organization.region, isouter=True
            ).filter(Region.name.in_(region_list))
            
        if tech_types:
            tech_type_list = tech_types.split(',')
            query = query.join(
                TechnologyType, Research.technology_type_id == TechnologyType.id, isouter=True
            ).filter(TechnologyType.name.in_(tech_type_list))
            
        if stages:
            stage_list = stages.split(',')
            query = query.join(
                DevelopmentStage, Research.development_stage_id == DevelopmentStage.id, isouter=True
            ).filter(DevelopmentStage.name.in_(stage_list))
        
        # Если указаны направления, фильтруем результат только по указанным направлениям
        if directions:
            direction_list = directions.split(',')
            query = query.filter(Direction.name.in_(direction_list))
        
        # Группируем и получаем результат
        try:
            stats = query.group_by(Direction.name).all()
            
            # Преобразуем результат в словарь
            result = [{"direction": item.direction_name, "count": item.research_count} for item in stats]
            
            logger.info(f"Запрошена статистика исследований по направлениям. Найдено: {len(result)} записей")
            return result
        except Exception as query_error:
            logger.error(f"Ошибка выполнения запроса статистики по направлениям: {str(query_error)}")
            # Возвращаем пустой список вместо ошибки
            return []
    except Exception as e:
        logger.error(f"Ошибка при получении статистики по направлениям: {str(e)}")
        # Возвращаем пустой список вместо ошибки
        return []

@router.get("/research/{research_id}", response_model=ResearchResponse)
def get_research(research_id: int, db: Session = Depends(get_db)):
    try:
        research = db.query(Research).filter(Research.id == research_id).first()
        if not research:
            raise HTTPException(status_code=404, detail="Исследование не найдено")
        logger.info(f"Запрошено исследование с ID {research_id}")
        return research
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Ошибка при получении исследования: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при получении исследования: {str(e)}"
        ) 