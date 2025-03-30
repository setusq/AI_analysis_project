import { useState, useEffect } from 'react'
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
    direction: ''
  })

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
    setSelectedResearch(research)
    setShowModal(true)
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
  
  // Применение фильтров к списку исследований
  const applyFilters = () => {
    let filtered = [...researchList]
    
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
    
    // Фильтр по региону
    if (filters.region) {
      filtered = filtered.filter(item => 
        item.regions && item.regions.some(region => region.id === parseInt(filters.region))
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
      direction: ''
    })
  }

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
      
      {/* Информация о результатах фильтрации */}
      <div className="filter-results-info">
        Найдено исследований: {filteredList.length} из {researchList.length}
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
              <div className="research-type">
                <span className="label">Тип технологии:</span> 
                <span>{research.technology_type?.name || 'Не указан'}</span>
              </div>
              <div className="research-stage">
                <span className="label">Этап:</span> 
                <span>{research.development_stage?.name || 'Не указан'}</span>
              </div>
              <div className="research-regions">
                <span className="label">Регионы:</span> 
                <span>{research.regions && research.regions.length > 0 
                  ? research.regions.map(region => region.name).join(', ')
                  : 'Не указаны'}</span>
              </div>
              <div className="research-date">
                <span className="label">Дата:</span> 
                <span>{new Date(research.start_date).toLocaleDateString()}</span>
              </div>
              <p className="research-description">
                {research.description.length > 100 
                  ? `${research.description.substring(0, 100)}...` 
                  : research.description}
              </p>
              <div className="research-actions">
                <button 
                  className="view-button" 
                  onClick={() => handleViewDetails(research)}
                >
                  Просмотр
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
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-button" onClick={() => setShowModal(false)}>×</button>
            
            <h2>{selectedResearch.name}</h2>
            
            <div className="modal-field">
              <span className="label">Описание:</span>
              <p>{selectedResearch.description}</p>
            </div>
            
            <div className="modal-field">
              <span className="label">Тип технологии:</span>
              <p>{selectedResearch.technology_type?.name || 'Не указан'}</p>
            </div>
            
            <div className="modal-field">
              <span className="label">Этап разработки:</span>
              <p>{selectedResearch.development_stage?.name || 'Не указан'}</p>
            </div>
            
            <div className="modal-field">
              <span className="label">Дата начала:</span>
              <p>{new Date(selectedResearch.start_date).toLocaleDateString()}</p>
            </div>
            
            <div className="modal-field">
              <span className="label">Источник:</span>
              <p>
                <a 
                  href={selectedResearch.source_link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  {selectedResearch.source_link}
                </a>
              </p>
            </div>
            
            <div className="modal-field">
              <span className="label">Регионы:</span>
              <p>
                {selectedResearch.regions && selectedResearch.regions.length > 0
                  ? selectedResearch.regions.map(region => region.name).join(', ')
                  : 'Не указаны'}
              </p>
            </div>
            
            <div className="modal-field">
              <span className="label">Организации:</span>
              <p>
                {selectedResearch.organizations && selectedResearch.organizations.length > 0
                  ? selectedResearch.organizations.map(org => org.name).join(', ')
                  : 'Не указаны'}
              </p>
            </div>
            
            <div className="modal-field">
              <span className="label">Люди:</span>
              <p>
                {selectedResearch.people && selectedResearch.people.length > 0
                  ? selectedResearch.people.map(person => person.name).join(', ')
                  : 'Не указаны'}
              </p>
            </div>
            
            <div className="modal-field">
              <span className="label">Направления:</span>
              <p>
                {selectedResearch.directions && selectedResearch.directions.length > 0
                  ? selectedResearch.directions.map(direction => direction.name).join(', ')
                  : 'Не указаны'}
              </p>
            </div>
            
            <div className="modal-actions">
              <button 
                className="edit-button"
                onClick={() => {
                  handleEditClick(selectedResearch)
                  setShowModal(false)
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