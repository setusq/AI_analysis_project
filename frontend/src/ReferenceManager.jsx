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
  { id: 'directions', name: 'Направления' }
]

function ReferenceManager() {
  const [activeTab, setActiveTab] = useState('technology-types')
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [newItemName, setNewItemName] = useState('')
  const [editingItem, setEditingItem] = useState(null)
  const [editName, setEditName] = useState('')
  
  // Получение данных при изменении активной вкладки
  useEffect(() => {
    fetchReferenceData(activeTab)
  }, [activeTab])

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
      const response = await fetch(`${API_BASE_URL}/references/${activeTab}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          name: newItemName,
          description: ''
        }),
      })
      
      if (!response.ok) {
        throw new Error(`Ошибка: ${response.status}`)
      }
      
      // Обновляем список после добавления
      fetchReferenceData(activeTab)
      setNewItemName('')
      
    } catch (err) {
      console.error('Ошибка при добавлении записи:', err)
      setError(err.message || 'Произошла ошибка при добавлении записи')
    }
  }

  // Редактирование элемента
  const handleEditClick = (item) => {
    setEditingItem(item)
    setEditName(item.name)
  }

  // Отмена редактирования
  const handleCancelEdit = () => {
    setEditingItem(null)
    setEditName('')
  }

  // Сохранение отредактированного элемента
  const handleSaveEdit = async () => {
    if (!editName.trim()) {
      setError('Введите название')
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/references/${activeTab}/${editingItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          name: editName,
          description: editingItem.description || ''
        }),
      })
      
      if (!response.ok) {
        throw new Error(`Ошибка обновления: ${response.status}`)
      }
      
      // Обновляем список после редактирования
      fetchReferenceData(activeTab)
      setEditingItem(null)
      setEditName('')
      
    } catch (err) {
      console.error('Ошибка при обновлении записи:', err)
      setError(err.message || 'Произошла ошибка при обновлении записи')
    }
  }

  return (
    <div className="reference-manager">
      <h2>Управление справочниками</h2>

      {/* Вкладки */}
      <div className="reference-tabs">
        {CATEGORIES.map(category => (
          <button
            key={category.id}
            className={activeTab === category.id ? 'active' : ''}
            onClick={() => setActiveTab(category.id)}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Контент */}
      <div className="reference-content">
        {/* Список элементов */}
        <div className="reference-list">
          <h3>Текущие записи</h3>
          
          {loading ? (
            <div className="loading">Загрузка данных...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : data.length === 0 ? (
            <div>Нет данных</div>
          ) : (
            <ul>
              {data.map(item => (
                <li key={item.id} className="reference-item">
                  <span className="item-name">{item.name}</span>
                  <div className="item-actions">
                    <button 
                      onClick={() => handleEditClick(item)}
                      className="edit-button"
                    >
                      Редактировать
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
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