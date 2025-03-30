import { useState, useEffect } from 'react'
import './ResearchForm.css'

// API базовый URL
const API_BASE_URL = 'http://localhost:8001/api';

function ResearchForm({ references, editingResearch, onSubmitSuccess }) {
  const initialFormState = {
    name: '',
    description: '',
    technology_type_id: '',
    development_stage_id: '',
    start_date: '',
    source_link: '',
    region_ids: [],
    organization_ids: [],
    person_ids: [],
    direction_ids: []
  }

  const [formData, setFormData] = useState(initialFormState)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    // Инициализация формы данными для редактирования
    if (editingResearch) {
      console.log("Данные для редактирования:", editingResearch);
      
      // Преобразуем связанные объекты в массивы ID
      const regionIds = editingResearch.regions ? 
        editingResearch.regions.map(region => region.id) : [];
      
      const organizationIds = editingResearch.organizations ? 
        editingResearch.organizations.map(org => org.id) : [];
      
      const personIds = editingResearch.people ? 
        editingResearch.people.map(person => person.id) : [];
      
      const directionIds = editingResearch.directions ? 
        editingResearch.directions.map(direction => direction.id) : [];

      setFormData({
        name: editingResearch.name || '',
        description: editingResearch.description || '',
        technology_type_id: editingResearch.technology_type?.id || '',
        development_stage_id: editingResearch.development_stage?.id || '',
        start_date: editingResearch.start_date || '',
        source_link: editingResearch.source_link || '',
        region_ids: regionIds,
        organization_ids: organizationIds,
        person_ids: personIds,
        direction_ids: directionIds
      })
    } else {
      setFormData(initialFormState)
    }
  }, [editingResearch])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }))
  }

  const handleCheckboxChange = (e, category) => {
    const value = parseInt(e.target.value, 10)
    const isChecked = e.target.checked
    
    setFormData(prevData => {
      if (isChecked) {
        // Добавляем значение, если его еще нет в массиве
        return {
          ...prevData,
          [category]: prevData[category].includes(value) ? prevData[category] : [...prevData[category], value]
        }
      } else {
        // Удаляем значение из массива
        return {
          ...prevData,
          [category]: prevData[category].filter(id => id !== value)
        }
      }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    
    try {
      const method = editingResearch ? 'PUT' : 'POST'
      const url = editingResearch 
        ? `${API_BASE_URL}/research/${editingResearch.id}` 
        : `${API_BASE_URL}/research/`
      
      console.log(`Отправка ${method} запроса на ${url} с данными:`, formData)
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Ошибка ответа API:", response.status, errorText);
        throw new Error(`Ошибка сервера: ${response.status} ${errorText.substring(0, 200)}`);
      }
      
      const responseData = await response.json()
      console.log("Успешный ответ:", responseData);
      
      setSuccess(true)
      setFormData(initialFormState)
      
      // Уведомляем родительский компонент об успешном создании/обновлении
      if (onSubmitSuccess) {
        onSubmitSuccess(responseData)
      }
      
      // Показываем сообщение об успехе на 3 секунды
      setTimeout(() => {
        setSuccess(false)
      }, 3000)
      
    } catch (err) {
      console.error('Ошибка при отправке формы:', err)
      setError(err.message || 'Произошла ошибка при сохранении исследования')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="research-form-container">
      {success && (
        <div className="success-message">
          Исследование успешно {editingResearch ? 'обновлено' : 'добавлено'}!
        </div>
      )}
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <form className="research-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Название исследования:</label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Описание:</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="technology_type_id">Тип технологии:</label>
          <select
            id="technology_type_id"
            name="technology_type_id"
            value={formData.technology_type_id}
            onChange={handleInputChange}
            required
          >
            <option value="">Выберите тип технологии</option>
            {references.technologyTypes.map(type => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="development_stage_id">Этап разработки:</label>
          <select
            id="development_stage_id"
            name="development_stage_id"
            value={formData.development_stage_id}
            onChange={handleInputChange}
            required
          >
            <option value="">Выберите этап разработки</option>
            {references.developmentStages.map(stage => (
              <option key={stage.id} value={stage.id}>
                {stage.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="start_date">Дата начала:</label>
          <input
            id="start_date"
            name="start_date"
            type="date"
            value={formData.start_date}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="source_link">Ссылка на источник:</label>
          <input
            id="source_link"
            name="source_link"
            type="url"
            value={formData.source_link}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Регионы:</label>
          <div className="checkbox-group">
            {references.regions.map(region => (
              <div key={region.id} className="checkbox-item">
                <input
                  type="checkbox"
                  id={`region-${region.id}`}
                  value={region.id}
                  checked={formData.region_ids.includes(region.id)}
                  onChange={(e) => handleCheckboxChange(e, 'region_ids')}
                />
                <label htmlFor={`region-${region.id}`}>{region.name}</label>
              </div>
            ))}
          </div>
        </div>
        
        <div className="form-group">
          <label>Направления:</label>
          <div className="checkbox-group">
            {references.directions.map(direction => (
              <div key={direction.id} className="checkbox-item">
                <input
                  type="checkbox"
                  id={`direction-${direction.id}`}
                  value={direction.id}
                  checked={formData.direction_ids.includes(direction.id)}
                  onChange={(e) => handleCheckboxChange(e, 'direction_ids')}
                />
                <label htmlFor={`direction-${direction.id}`}>{direction.name}</label>
              </div>
            ))}
          </div>
        </div>
        
        <div className="form-group">
          <label>Организации:</label>
          <div className="checkbox-group">
            {references.organizations.map(organization => (
              <div key={organization.id} className="checkbox-item">
                <input
                  type="checkbox"
                  id={`organization-${organization.id}`}
                  value={organization.id}
                  checked={formData.organization_ids.includes(organization.id)}
                  onChange={(e) => handleCheckboxChange(e, 'organization_ids')}
                />
                <label htmlFor={`organization-${organization.id}`}>{organization.name}</label>
              </div>
            ))}
          </div>
        </div>
        
        <div className="form-group">
          <label>Люди:</label>
          <div className="checkbox-group">
            {references.people.map(person => (
              <div key={person.id} className="checkbox-item">
                <input
                  type="checkbox"
                  id={`person-${person.id}`}
                  value={person.id}
                  checked={formData.person_ids.includes(person.id)}
                  onChange={(e) => handleCheckboxChange(e, 'person_ids')}
                />
                <label htmlFor={`person-${person.id}`}>{person.name}</label>
              </div>
            ))}
          </div>
        </div>
        
        <div className="form-actions">
          <button 
            type="submit" 
            className="submit-button" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Сохранение...' : (editingResearch ? 'Обновить' : 'Добавить')}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ResearchForm 