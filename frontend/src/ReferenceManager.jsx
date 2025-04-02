import { useState, useEffect } from 'react'
import './ReferenceManager.css'

// API базовый URL
const API_BASE_URL = 'http://localhost:8001/api'

// Категории справочников
const CATEGORIES = [
  { id: 'technology-types', name: 'Типы технологий' },
  { id: 'development-stages', name: 'Этапы разработки' },
  { id: 'regions', name: 'Регионы' },
  { id: 'organizations', name: 'Организации' },
  { id: 'people', name: 'Люди' },
  { id: 'directions', name: 'Направления' },
  { id: 'sources', name: 'Источники' }
]

// Типы источников
const SOURCE_TYPES = [
  'Научный журнал',
  'Новостной портал',
  'Федеральный научный центр',
  'Образовательное учреждение',
  'Государственное учреждение',
  'Репозиторий научных работ',
  'Научная социальная сеть',
  'Научная электронная библиотека',
  'Научное издательство',
  'Другое'
]

// Типы организаций
const ORGANIZATION_TYPES = [
  'Государственная компания',
  'Частная компания',
  'Университет',
  'Научно-исследовательский институт',
  'Федеральное агентство',
  'Международная организация',
  'Стартап',
  'Некоммерческая организация',
  'Другое'
]

function ReferenceManager() {
  const [activeTab, setActiveTab] = useState('technology-types')
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [newItemName, setNewItemName] = useState('')
  const [newItemUrl, setNewItemUrl] = useState('')
  const [newItemDescription, setNewItemDescription] = useState('')
  const [newItemRegionId, setNewItemRegionId] = useState('')
  const [newItemSourceType, setNewItemSourceType] = useState('')
  const [newItemOrganizationType, setNewItemOrganizationType] = useState('')
  const [editingItem, setEditingItem] = useState(null)
  const [editName, setEditName] = useState('')
  const [editUrl, setEditUrl] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editRegionId, setEditRegionId] = useState('')
  const [editSourceType, setEditSourceType] = useState('')
  const [editOrganizationType, setEditOrganizationType] = useState('')
  const [regions, setRegions] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  
  // Получение данных при изменении активной вкладки
  useEffect(() => {
    fetchReferenceData(activeTab)
    
    // Если текущая вкладка - организации, загрузим список регионов
    if (activeTab === 'organizations') {
      fetchRegions()
    }
  }, [activeTab])
  
  // Получение списка регионов для выбора
  const fetchRegions = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/references/regions`)
      
      if (!response.ok) {
        throw new Error(`Ошибка загрузки регионов: ${response.status}`)
      }
      
      const result = await response.json()
      setRegions(result || [])
    } catch (err) {
      console.error('Ошибка при загрузке регионов:', err)
    }
  }

  // Получение данных справочника
  const fetchReferenceData = async (category) => {
    setLoading(true)
    setError(null)
    
    try {
      const url = `${API_BASE_URL}/references/${category}`
      
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`Ошибка загрузки данных: ${response.status}`)
      }
      
      const result = await response.json()
      
      setData(result || [])
    } catch (err) {
      console.error(`Ошибка при загрузке справочника ${category}:`, err)
      setError(err.message || 'Произошла ошибка при загрузке данных')
      setData([])
    } finally {
      setLoading(false)
    }
  }

  // Добавление нового элемента
  const handleAddItem = async (e) => {
    e.preventDefault()
    
    if (!newItemName.trim()) {
      setError('Введите название')
      return
    }
    
    try {
      const itemData = { 
        name: newItemName,
        description: newItemDescription
      }

      // Если это источник, добавляем URL и тип источника
      if (activeTab === 'sources') {
        itemData.url = newItemUrl
        itemData.source_type = newItemSourceType
      }
      
      // Если это организация, добавляем ID региона и тип организации
      if (activeTab === 'organizations') {
        if (newItemRegionId) {
          itemData.region_id = parseInt(newItemRegionId)
        }
        itemData.organization_type = newItemOrganizationType
      }

      const response = await fetch(`${API_BASE_URL}/references/${activeTab}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(itemData),
      })
      
      if (!response.ok) {
        throw new Error(`Ошибка: ${response.status}`)
      }
      
      // Обновляем список после добавления
      fetchReferenceData(activeTab)
      setNewItemName('')
      setNewItemUrl('')
      setNewItemDescription('')
      setNewItemRegionId('')
      setNewItemSourceType('')
      setNewItemOrganizationType('')
      
    } catch (err) {
      console.error('Ошибка при добавлении записи:', err)
      setError(err.message || 'Произошла ошибка при добавлении записи')
    }
  }

  // Редактирование элемента
  const handleEditClick = (item) => {
    setEditingItem(item)
    setEditName(item.name)
    setEditDescription(item.description || '')
    if (activeTab === 'sources') {
      setEditUrl(item.url || '')
      setEditSourceType(item.source_type || '')
    } else {
      setEditUrl('')
      setEditSourceType('')
    }
    
    if (activeTab === 'organizations') {
      setEditRegionId(item.region_id || '')
      setEditOrganizationType(item.organization_type || '')
    } else {
      setEditOrganizationType('')
    }
  }

  // Отмена редактирования
  const handleCancelEdit = () => {
    setEditingItem(null)
    setEditName('')
    setEditUrl('')
    setEditDescription('')
    setEditRegionId('')
    setEditSourceType('')
    setEditOrganizationType('')
  }

  // Сохранение отредактированного элемента
  const handleSaveEdit = async () => {
    if (!editName.trim()) {
      setError('Введите название')
      return
    }

    try {
      const itemData = { 
        name: editName,
        description: editDescription
      }

      // Если это источник, добавляем URL и тип источника
      if (activeTab === 'sources') {
        itemData.url = editUrl
        itemData.source_type = editSourceType
      }
      
      // Если это организация, добавляем ID региона и тип организации
      if (activeTab === 'organizations') {
        if (editRegionId) {
          itemData.region_id = parseInt(editRegionId)
        } else {
          itemData.region_id = null
        }
        itemData.organization_type = editOrganizationType
      }

      const response = await fetch(`${API_BASE_URL}/references/${activeTab}/${editingItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(itemData),
      })
      
      if (!response.ok) {
        throw new Error(`Ошибка обновления: ${response.status}`)
      }
      
      // Обновляем список после редактирования
      fetchReferenceData(activeTab)
      setEditingItem(null)
      setEditName('')
      setEditUrl('')
      setEditDescription('')
      setEditRegionId('')
      setEditSourceType('')
      setEditOrganizationType('')
      
    } catch (err) {
      console.error('Ошибка при обновлении записи:', err)
      setError(err.message || 'Произошла ошибка при обновлении записи')
    }
  }

  // Удаление элемента
  const handleDeleteItem = async (itemId) => {
    if (!confirm('Вы уверены, что хотите удалить эту запись?')) {
      return
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/references/${activeTab}/${itemId}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error(`Ошибка удаления: ${response.status}`)
      }
      
      // Обновляем список после удаления
      fetchReferenceData(activeTab)
      
    } catch (err) {
      console.error('Ошибка при удалении записи:', err)
      setError(err.message || 'Произошла ошибка при удалении записи')
    }
  }

  // Получение названия региона по ID
  const getRegionName = (regionId) => {
    if (!regionId) return 'Не указан';
    const region = regions.find(r => r.id === regionId);
    return region ? region.name : 'Неизвестный регион';
  }

  // Фильтрация данных по поисковому запросу
  const filteredData = data.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="reference-manager">
      <h2>Управление справочниками</h2>

      {/* Вкладки */}
      <div className="tabs">
        {CATEGORIES.map(category => (
          <button
            key={category.id}
            className={`tab ${activeTab === category.id ? 'active' : ''}`}
            onClick={() => setActiveTab(category.id)}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Контент */}
      <div className="content">
        <div className="current-items">
          <h3>Текущие записи</h3>
          <div className="search-box">
            <input
              type="text"
              placeholder="Поиск по названию..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="items-list">
            {loading ? (
              <p>Загрузка...</p>
            ) : error ? (
              <p className="error">{error}</p>
            ) : filteredData.length === 0 ? (
              <p>Записей не найдено</p>
            ) : (
              filteredData.map(item => (
                <div key={item.id} className="item">
                  <div className="item-content">
                    <span className="item-name">{item.name}</span>
                    {item.description && (
                      <span className="item-description">{item.description}</span>
                    )}
                    {activeTab === 'sources' && item.url && (
                      <span className="item-url">{item.url}</span>
                    )}
                    {activeTab === 'organizations' && item.region && (
                      <span className="item-region">Регион: {item.region.name}</span>
                    )}
                    {activeTab === 'sources' && item.source_type && (
                      <span className="item-type">Тип: {item.source_type}</span>
                    )}
                    {activeTab === 'organizations' && item.organization_type && (
                      <span className="item-type">Тип: {item.organization_type}</span>
                    )}
                  </div>
                  <div className="item-actions">
                    <button onClick={() => handleEditClick(item)}>Редактировать</button>
                    <button onClick={() => handleDeleteItem(item.id)}>Удалить</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* Форма добавления или редактирования */}
        <div className="reference-form">
          <h3>{editingItem ? 'Редактировать запись' : 'Добавить новую запись'}</h3>
          
          {error && (
            <div className="error-message">{error}</div>
          )}
          
          {editingItem ? (
            // Форма редактирования
            <div>
              <div className="form-group">
                <label htmlFor="editName">
                  Название:
                </label>
                <input
                  type="text"
                  id="editName"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="editDescription">
                  Описание:
                </label>
                <textarea
                  id="editDescription"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows="3"
                  placeholder="Введите описание"
                />
              </div>
              
              {activeTab === 'sources' && (
                <>
                  <div className="form-group">
                    <label htmlFor="editUrl">
                      URL:
                    </label>
                    <input
                      type="url"
                      id="editUrl"
                      value={editUrl}
                      onChange={(e) => setEditUrl(e.target.value)}
                      placeholder="https://example.com"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="editSourceType">
                      Тип источника:
                    </label>
                    <select
                      id="editSourceType"
                      value={editSourceType}
                      onChange={(e) => setEditSourceType(e.target.value)}
                    >
                      <option value="">Выберите тип источника</option>
                      {SOURCE_TYPES.map(type => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}
              
              {activeTab === 'organizations' && (
                <div className="form-group">
                  <label htmlFor="editRegionId">
                    Регион:
                  </label>
                  <select
                    id="editRegionId"
                    value={editRegionId}
                    onChange={(e) => setEditRegionId(e.target.value)}
                  >
                    <option value="">Выберите регион</option>
                    {regions.map(region => (
                      <option key={region.id} value={region.id}>
                        {region.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              {activeTab === 'organizations' && (
                <div className="form-group">
                  <label htmlFor="editOrganizationType">
                    Тип организации:
                  </label>
                  <select
                    id="editOrganizationType"
                    value={editOrganizationType}
                    onChange={(e) => setEditOrganizationType(e.target.value)}
                  >
                    <option value="">Выберите тип организации</option>
                    {ORGANIZATION_TYPES.map(type => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              <div className="form-buttons">
                <button 
                  onClick={handleSaveEdit}
                  className="update-button"
                >
                  Сохранить
                </button>
                <button 
                  onClick={handleCancelEdit}
                  className="cancel-button"
                >
                  Отмена
                </button>
              </div>
            </div>
          ) : (
            // Форма добавления
            <form onSubmit={handleAddItem}>
              <div className="form-group">
                <label htmlFor="name">
                  Название:
                </label>
                <input
                  type="text"
                  id="name"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">
                  Описание:
                </label>
                <textarea
                  id="description"
                  value={newItemDescription}
                  onChange={(e) => setNewItemDescription(e.target.value)}
                  rows="3"
                  placeholder="Введите описание"
                />
              </div>

              {activeTab === 'sources' && (
                <>
                  <div className="form-group">
                    <label htmlFor="url">
                      URL:
                    </label>
                    <input
                      type="url"
                      id="url"
                      value={newItemUrl}
                      onChange={(e) => setNewItemUrl(e.target.value)}
                      placeholder="https://example.com"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="sourceType">
                      Тип источника:
                    </label>
                    <select
                      id="sourceType"
                      value={newItemSourceType}
                      onChange={(e) => setNewItemSourceType(e.target.value)}
                    >
                      <option value="">Выберите тип источника</option>
                      {SOURCE_TYPES.map(type => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}
              
              {activeTab === 'organizations' && (
                <div className="form-group">
                  <label htmlFor="regionId">
                    Регион:
                  </label>
                  <select
                    id="regionId"
                    value={newItemRegionId}
                    onChange={(e) => setNewItemRegionId(e.target.value)}
                  >
                    <option value="">Выберите регион</option>
                    {regions.map(region => (
                      <option key={region.id} value={region.id}>
                        {region.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              {activeTab === 'organizations' && (
                <div className="form-group">
                  <label htmlFor="organizationType">
                    Тип организации:
                  </label>
                  <select
                    id="organizationType"
                    value={newItemOrganizationType}
                    onChange={(e) => setNewItemOrganizationType(e.target.value)}
                  >
                    <option value="">Выберите тип организации</option>
                    {ORGANIZATION_TYPES.map(type => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              <button 
                type="submit" 
                className="add-button"
              >
                Добавить
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default ReferenceManager 