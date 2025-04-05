import { useState, useEffect, useRef } from 'react'
import './ResearchList.css'

function ResearchList({ onEditResearch }) {
  const [researchList, setResearchList] = useState([])
  const [filteredList, setFilteredList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedResearch, setSelectedResearch] = useState(null)
  const [showModal, setShowModal] = useState(false)
  
  // Справочники для фильтров
  const [references, setReferences] = useState({
    technologyTypes: [],
    developmentStages: [],
    regions: [],
    directions: []
  })
  
  // Состояние фильтров
  const [filters, setFilters] = useState({
    technologyType: '',
    developmentStage: '',
    region: '',
    direction: '',
    searchQuery: ''
  })

  // Ссылка на модальное окно
  const modalRef = useRef(null)
  
  useEffect(() => {
    fetchResearch()
    fetchReferences()
  }, [])
  
  // Применяем фильтры при изменении списка исследований или фильтров
  useEffect(() => {
    applyFilters()
  }, [researchList, filters])

  const fetchReferences = async () => {
    try {
      const baseUrl = 'http://localhost:8001/api/references'
      const [
        technologyTypesRes, 
        developmentStagesRes, 
        regionsRes, 
        directionsRes
      ] = await Promise.all([
        fetch(`${baseUrl}/technology-types`),
        fetch(`${baseUrl}/development-stages`),
        fetch(`${baseUrl}/regions`),
        fetch(`${baseUrl}/directions`)
      ])
      
      if (technologyTypesRes.ok && developmentStagesRes.ok && regionsRes.ok && directionsRes.ok) {
        const technologyTypes = await technologyTypesRes.json()
        const developmentStages = await developmentStagesRes.json()
        const regions = await regionsRes.json()
        const directions = await directionsRes.json()
        
        setReferences({
          technologyTypes,
          developmentStages,
          regions,
          directions
        })
      }
    } catch (error) {
      console.error('Ошибка при загрузке справочников для фильтров:', error)
    }
  }

  const fetchResearch = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:8001/api/research/')
      
      if (response.ok) {
        const data = await response.json()
        console.log("Полученные данные исследований:", data);
        setResearchList(data)
        setError(null)
      } else {
        const errorData = await response.json()
        setError(errorData.detail || 'Не удалось загрузить данные исследований')
        
        // В случае ошибки загрузим тестовые данные
        setResearchList(getSampleData())
      }
    } catch (error) {
      console.error('Ошибка при загрузке исследований:', error)
      setError('Ошибка при загрузке исследований. Проверьте соединение с сервером.')
      
      // В случае ошибки загрузим тестовые данные
      setResearchList(getSampleData())
    } finally {
      setLoading(false)
    }
  }

  const getSampleData = () => {
    return [
      {
        id: 1,
        name: 'Развитие нейронных сетей GPT',
        description: 'Исследование эволюции моделей GPT от OpenAI с 2018 года',
        technology_type: { id: 1, name: 'Искусственный интеллект' },
        development_stage: { id: 3, name: 'Внедрение' },
        start_date: '2020-06-11',
        source_link: 'https://openai.com',
        regions: [{ id: 1, name: 'Северная Америка' }],
        organizations: [{ id: 1, name: 'OpenAI' }],
        people: [{ id: 1, name: 'Сэм Альтман' }],
        directions: [{ id: 1, name: 'Обработка естественного языка' }]
      },
      {
        id: 2,
        name: 'Компьютерное зрение в автономных транспортных средствах',
        description: 'Исследование применения технологий компьютерного зрения в беспилотных автомобилях',
        technology_type: { id: 4, name: 'Компьютерное зрение' },
        development_stage: { id: 2, name: 'Разработка' },
        start_date: '2019-03-15',
        source_link: 'https://waymo.com',
        regions: [{ id: 1, name: 'Северная Америка' }, { id: 2, name: 'Европа' }],
        organizations: [{ id: 2, name: 'Waymo' }, { id: 3, name: 'Tesla' }],
        people: [],
        directions: [{ id: 4, name: 'Транспорт' }]
      }
    ]
  }

  const handleViewDetails = (research) => {
    setSelectedResearch(research);
    setShowModal(true);
    // Блокировка прокрутки основного документа при открытии модального окна
    document.body.style.overflow = 'hidden';
    document.body.classList.add('modal-open');

    // Запоминаем текущую позицию прокрутки для восстановления при закрытии
    document.body.dataset.scrollY = window.scrollY;
  }

  const handleEditClick = (research) => {
    if (onEditResearch) {
      onEditResearch(research)
    }
  }
  
  // Обработчик изменения фильтров
  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters(prev => ({
      ...prev,
      [name]: value
    }))
  }
  
  // Обработчик изменения поискового запроса
  const handleSearchChange = (e) => {
    const { value } = e.target
    setFilters(prev => ({
      ...prev,
      searchQuery: value
    }))
  }
  
  // Экспорт результатов в CSV
  const handleExportCSV = () => {
    // Формируем URL с текущими фильтрами
    let url = 'http://localhost:8001/api/research/export-results-csv'
    const params = new URLSearchParams()
    
    if (filters.searchQuery) {
      params.append('name', filters.searchQuery)
    }
    
    if (filters.technologyType) {
      params.append('technology_type_id', filters.technologyType)
    }
    
    if (filters.developmentStage) {
      params.append('development_stage_id', filters.developmentStage)
    }
    
    if (filters.direction) {
      params.append('direction_id', filters.direction)
    }
    
    if (filters.region) {
      params.append('organization_id', filters.region) // Предполагаем, что фильтр по региону связан с организациями
    }
    
    // Добавляем параметры запроса, если они есть
    if (params.toString()) {
      url += `?${params.toString()}`
    }
    
    // Открываем новое окно для скачивания файла
    window.open(url, '_blank')
  }
  
  // Применение фильтров к списку исследований
  const applyFilters = () => {
    let filtered = [...researchList]
    
    // Фильтр по названию (поиск)
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase()
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(query)
      )
    }
    
    // Фильтр по типу технологии
    if (filters.technologyType) {
      filtered = filtered.filter(item => 
        item.technology_type && item.technology_type.id === parseInt(filters.technologyType)
      )
    }
    
    // Фильтр по этапу разработки
    if (filters.developmentStage) {
      filtered = filtered.filter(item => 
        item.development_stage && item.development_stage.id === parseInt(filters.developmentStage)
      )
    }
    
    // Фильтр по региону (с учетом регионов организаций)
    if (filters.region) {
      const regionId = parseInt(filters.region)
      filtered = filtered.filter(item => 
        // Прямые регионы исследования
        (item.regions && item.regions.some(region => region.id === regionId)) ||
        // Регионы организаций
        (item.organizations && item.organizations.some(org => 
          org.region && org.region.id === regionId
        ))
      )
    }
    
    // Фильтр по направлению
    if (filters.direction) {
      filtered = filtered.filter(item => 
        item.directions && item.directions.some(direction => direction.id === parseInt(filters.direction))
      )
    }
    
    setFilteredList(filtered)
  }
  
  // Сброс фильтров
  const resetFilters = () => {
    setFilters({
      technologyType: '',
      developmentStage: '',
      region: '',
      direction: '',
      searchQuery: ''
    })
  }

  // Закрытие модального окна и разблокировка прокрутки
  const handleCloseModal = () => {
    setShowModal(false);
    // Восстановление прокрутки основного документа
    document.body.style.overflow = 'auto';
    document.body.classList.remove('modal-open');
    
    // Восстанавливаем позицию прокрутки
    if (document.body.dataset.scrollY) {
      window.scrollTo(0, parseInt(document.body.dataset.scrollY || '0'));
    }
  };

  // Обработчик событий колесика мыши для модального окна
  const handleWheel = (e) => {
    e.stopPropagation();
    
    // Не предотвращаем стандартное поведение прокрутки, 
    // чтобы окно могло прокручиваться
    // Но останавливаем всплытие события, чтобы оно не передавалось внешней странице
  }

  // Обработчик события касания (для мобильных устройств)
  const handleTouchMove = (e) => {
    // Останавливаем всплытие события касания,
    // чтобы страница за модальным окном не прокручивалась
    e.stopPropagation();
  }
  
  // Функция для принудительного обновления скроллбара после открытия модального окна
  const forceScrollbarUpdate = (element) => {
    if (!element) return;
    
    // Сохраняем текущую позицию прокрутки
    const scrollTop = element.scrollTop;
    
    // Временно изменяем высоту содержимого, чтобы заставить браузер пересчитать скроллбар
    element.style.maxHeight = '79vh';
    setTimeout(() => {
      element.style.maxHeight = '80vh';
      // Восстанавливаем позицию прокрутки
      element.scrollTop = scrollTop;
    }, 10);
  };
  
  // Устанавливаем и убираем обработчик при открытии/закрытии модального окна
  useEffect(() => {
    const modal = modalRef.current;
    
    if (showModal && modal) {
      // При открытии модального окна устанавливаем фокус на него для скролла
      setTimeout(() => {
        modal.focus();
        // Прокручиваем в начало при каждом открытии
        modal.scrollTop = 0;
        // Запускаем обновление скроллбара
        forceScrollbarUpdate(modal);
      }, 50);
      
      // Добавляем обработчики для разных событий прокрутки
      modal.addEventListener('wheel', handleWheel);
      modal.addEventListener('touchmove', handleTouchMove);
      
      return () => {
        modal.removeEventListener('wheel', handleWheel);
        modal.removeEventListener('touchmove', handleTouchMove);
      };
    }
  }, [showModal]);

  if (loading) {
    return <div className="loading">Загрузка исследований...</div>
  }

  return (
    <div className="research-list-container">
      <h2>Список исследований</h2>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      {/* Панель фильтров */}
      <div className="filters-panel">
        <h3>Фильтры</h3>
        <div className="filters-grid">
          <div className="filter-group">
            <label htmlFor="technologyType">Тип технологии:</label>
            <select 
              id="technologyType" 
              name="technologyType" 
              value={filters.technologyType} 
              onChange={handleFilterChange}
            >
              <option value="">Все типы</option>
              {references.technologyTypes.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label htmlFor="developmentStage">Этап разработки:</label>
            <select 
              id="developmentStage" 
              name="developmentStage" 
              value={filters.developmentStage} 
              onChange={handleFilterChange}
            >
              <option value="">Все этапы</option>
              {references.developmentStages.map(stage => (
                <option key={stage.id} value={stage.id}>{stage.name}</option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label htmlFor="region">Регион:</label>
            <select 
              id="region" 
              name="region" 
              value={filters.region} 
              onChange={handleFilterChange}
            >
              <option value="">Все регионы</option>
              {references.regions.map(region => (
                <option key={region.id} value={region.id}>{region.name}</option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label htmlFor="direction">Направление:</label>
            <select 
              id="direction" 
              name="direction" 
              value={filters.direction} 
              onChange={handleFilterChange}
            >
              <option value="">Все направления</option>
              {references.directions.map(direction => (
                <option key={direction.id} value={direction.id}>{direction.name}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="filter-actions">
          <button className="reset-button" onClick={resetFilters}>
            Сбросить фильтры
          </button>
          <button className="refresh-button" onClick={fetchResearch}>
            Обновить список
          </button>
        </div>
      </div>
      
      <div className="filter-results-info">
        Найдено исследований: {filteredList.length} из {researchList.length}
      </div>
      
      {/* Панель поиска и экспорта */}
      <div className="search-export-panel">
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="Поиск по названию..."
            value={filters.searchQuery}
            onChange={handleSearchChange}
          />
        </div>
        
        <button 
          className="export-button" 
          onClick={handleExportCSV}
          title="Экспортировать результаты в CSV"
        >
          Экспорт в CSV
        </button>
      </div>
      
      {filteredList.length === 0 ? (
        <div className="empty-list">
          <p>Исследования не найдены</p>
          <p>Измените параметры фильтрации или добавьте новое исследование</p>
        </div>
      ) : (
        <div className="research-grid">
          {filteredList.map(research => (
            <div key={research.id} className="research-card">
              <h3>{research.name}</h3>
              
              <div className="research-content">
                <div className="research-main-info">
                  <div className="research-item">
                    <span className="research-label">Тип технологии:</span> 
                    <span className="research-value">{research.technology_type?.name || 'Не указан'}</span>
                  </div>
                  <div className="research-item">
                    <span className="research-label">Направление:</span> 
                    <span className="research-value">
                      {research.directions && research.directions.length > 0
                        ? research.directions.map(dir => dir.name).join(', ')
                        : 'Не указано'}
                    </span>
                  </div>
                  <div className="research-item">
                    <span className="research-label">Этап:</span> 
                    <span className="research-value">{research.development_stage?.name || 'Не указан'}</span>
                  </div>
                  <div className="research-item">
                    <span className="research-label">Дата:</span> 
                    <span className="research-value">{new Date(research.start_date).toLocaleDateString()}</span>
                  </div>
                  <div className="research-item">
                    <span className="research-label">Регион:</span> 
                    <span className="research-value">
                      {(research.regions && research.regions.length > 0) || 
                       (research.organizations && research.organizations.some(org => org.region)) ?
                        <>
                          {/* Прямые регионы исследования */}
                          {research.regions && research.regions.length > 0 && 
                            research.regions.map(region => region.name).join(', ')}
                          
                          {/* Разделитель если есть оба типа регионов */}
                          {research.regions && research.regions.length > 0 && 
                           research.organizations && research.organizations.some(org => org.region) && ', '}
                          
                          {/* Регионы организаций */}
                          {research.organizations && research.organizations
                            .filter(org => org.region)
                            .map(org => org.region.name)
                            .filter((name, index, self) => self.indexOf(name) === index) // Удаляем дубликаты
                            .join(', ')}
                        </>
                        : 'Не указан'}
                    </span>
                  </div>
                </div>
                
                <p className="research-description">
                  {research.description.length > 100 
                    ? `${research.description.substring(0, 100)}...` 
                    : research.description}
                </p>
              </div>
              
              <div className="research-actions">
                <button 
                  className="view-button" 
                  onClick={() => handleViewDetails(research)}
                >
                  Подробнее
                </button>
                <button 
                  className="edit-button"
                  onClick={() => handleEditClick(research)}
                >
                  Редактировать
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {showModal && selectedResearch && (
        <div className="modal-overlay" onClick={handleCloseModal} style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          width: '100vw',
          height: '100vh'
        }}>
          <div 
            className="modal-content modal-narrow" 
            onClick={e => e.stopPropagation()} 
            tabIndex={0}
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            onScroll={(e) => e.stopPropagation()}
            style={{
              width: '600px',
              maxWidth: '600px',
              backgroundColor: 'white',
              padding: '25px',
              borderRadius: '8px',
              overflowY: 'scroll',
              maxHeight: '80vh',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
            }}
          >
            <button className="close-button" onClick={handleCloseModal}>×</button>
            
            <h2>{selectedResearch.name}</h2>
            
            <div className="modal-sections-container">
              <div className="modal-section">
                <h3>Описание</h3>
                <p>{selectedResearch.description}</p>
              </div>
              
              <div className="modal-section">
                <h3>Основная информация</h3>
                <div className="modal-grid">
                  <div className="modal-field">
                    <span className="label">Тип технологии:</span>
                    <p>{selectedResearch.technology_type?.name || 'Не указан'}</p>
                  </div>
                  
                  <div className="modal-field">
                    <span className="label">Направления:</span>
                    <div>
                      {selectedResearch.directions && selectedResearch.directions.length > 0
                        ? selectedResearch.directions.map(direction => (
                            <p key={direction.id}>{direction.name}</p>
                          ))
                        : <p>Не указаны</p>
                      }
                    </div>
                  </div>
                  
                  <div className="modal-field">
                    <span className="label">Этап разработки:</span>
                    <p>{selectedResearch.development_stage?.name || 'Не указан'}</p>
                  </div>
                  
                  <div className="modal-field">
                    <span className="label">Дата начала:</span>
                    <p>{new Date(selectedResearch.start_date).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
              
              <div className="modal-section">
                <h3>Регионы</h3>
                <div className="modal-field regions-list">
                  {(selectedResearch.regions && selectedResearch.regions.length > 0) || 
                   (selectedResearch.organizations && selectedResearch.organizations.some(org => org.region)) ? (
                    <>
                      {/* Прямые регионы исследования */}
                      {selectedResearch.regions && selectedResearch.regions.map(region => (
                        <div key={`direct-${region.id}`} className="region-item">{region.name}</div>
                      ))}
                      
                      {/* Регионы из организаций */}
                      {selectedResearch.organizations && 
                        selectedResearch.organizations
                          .filter(org => org.region) // Только организации с регионами
                          .map(org => (
                            <div key={`org-${org.id}-region-${org.region.id}`} className="region-item org-region-item">
                              {org.region.name} (от {org.name})
                            </div>
                          ))
                      }
                    </>
                  ) : (
                    <p>Не указаны</p>
                  )}
                </div>
              </div>
              
              <div className="modal-section">
                <h3>Организации</h3>
                <div className="modal-field organizations-list">
                  {selectedResearch.organizations && selectedResearch.organizations.length > 0
                    ? selectedResearch.organizations.map(org => (
                        <div key={org.id} className="organization-item">
                          <div className="organization-header">
                            <span className="organization-name">{org.name}</span>
                            {org.organization_type && (
                              <>
                                <span className="organization-separator">|</span>
                                <span className="organization-type">{org.organization_type}</span>
                              </>
                            )}
                          </div>
                          {org.description && (
                            <div className="organization-description">{org.description}</div>
                          )}
                        </div>
                      ))
                    : <p>Не указаны</p>
                  }
                </div>
              </div>
              
              <div className="modal-section">
                <h3>Источники</h3>
                <div className="modal-field">
                  {selectedResearch.sources && selectedResearch.sources.length > 0
                    ? selectedResearch.sources.map(source => (
                        <div key={source.id} className="source-item">
                          <div className="source-header">
                            <span className="source-name">{source.name}</span>
                            {source.source_type && (
                              <>
                                <span className="source-separator">|</span>
                                <span className="source-type">{source.source_type}</span>
                              </>
                            )}
                          </div>
                          
                          {source.description && (
                            <p className="source-description">{source.description}</p>
                          )}
                          
                          {selectedResearch.source_link && (
                            <p className="source-detail-link">
                              <span className="source-link-label">Ссылка на источник: </span>
                              <a href={selectedResearch.source_link} target="_blank" rel="noopener noreferrer">
                                {selectedResearch.source_link}
                              </a>
                            </p>
                          )}
                        </div>
                      ))
                    : <p>Не указаны</p>
                  }
                </div>
              </div>
              
              <div className="modal-section">
                <h3>Участники</h3>
                <div className="people-list">
                  {selectedResearch.people && selectedResearch.people.length > 0
                    ? selectedResearch.people.map(person => (
                        <div key={person.id} className="person-item">
                          <span className="person-name">{person.name}</span>
                          {person.description && (
                            <>
                              <span className="person-separator">|</span>
                              <span className="person-description">{person.description}</span>
                            </>
                          )}
                        </div>
                      ))
                    : <p>Не указаны</p>
                  }
                </div>
              </div>
            </div>
            
            <div className="modal-actions">
              <button 
                className="edit-button"
                onClick={() => {
                  handleEditClick(selectedResearch);
                  handleCloseModal();
                }}
              >
                Редактировать
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ResearchList 