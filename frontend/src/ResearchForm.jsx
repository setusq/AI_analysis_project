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
    organization_ids: [],
    person_ids: [],
    direction_ids: [],
    source_ids: []
  }

  const [formData, setFormData] = useState(initialFormState)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  
  const [directionSearch, setDirectionSearch] = useState('')
  const [organizationSearch, setOrganizationSearch] = useState('')
  const [personSearch, setPersonSearch] = useState('')
  const [sourceSearch, setSourceSearch] = useState('')
  
  // Для CSV импорта
  const [csvFile, setCsvFile] = useState(null)
  const [importStatus, setImportStatus] = useState(null)
  const [isImporting, setIsImporting] = useState(false)

  useEffect(() => {
    if (editingResearch) {
      console.log("Данные для редактирования:", editingResearch);
      
      const organizationIds = editingResearch.organizations ? 
        editingResearch.organizations.map(org => org.id) : [];
      
      const personIds = editingResearch.people ? 
        editingResearch.people.map(person => person.id) : [];
      
      const directionIds = editingResearch.directions ? 
        editingResearch.directions.map(direction => direction.id) : [];
        
      const sourceIds = editingResearch.sources ? 
        editingResearch.sources.map(source => source.id) : [];

      setFormData({
        name: editingResearch.name || '',
        description: editingResearch.description || '',
        technology_type_id: editingResearch.technology_type?.id || '',
        development_stage_id: editingResearch.development_stage?.id || '',
        start_date: editingResearch.start_date || '',
        source_link: editingResearch.source_link || '',
        organization_ids: organizationIds,
        person_ids: personIds,
        direction_ids: directionIds,
        source_ids: sourceIds
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
        return {
          ...prevData,
          [category]: prevData[category].includes(value) ? prevData[category] : [...prevData[category], value]
        }
      } else {
        return {
          ...prevData,
          [category]: prevData[category].filter(id => id !== value)
        }
      }
    })
  }

  const filterList = (list, searchTerm) => {
    if (!searchTerm) return list;
    return list.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
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
      
      if (onSubmitSuccess) {
        onSubmitSuccess(responseData)
      }
      
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
  
  // Обработчики для CSV импорта
  const handleCsvFileChange = (e) => {
    setCsvFile(e.target.files[0])
  }
  
  const handleCsvImport = async () => {
    if (!csvFile) {
      setError('Пожалуйста, выберите CSV файл')
      return
    }
    
    setIsImporting(true)
    setError(null)
    setImportStatus(null)
    
    try {
      const formData = new FormData()
      formData.append('file', csvFile)
      
      console.log('Отправка CSV файла на сервер...', csvFile.name, csvFile.size + ' bytes')
      
      const response = await fetch(`${API_BASE_URL}/research/import-csv`, {
        method: 'POST',
        body: formData
      })
      
      // Получаем текст ответа для отладки
      const responseText = await response.text()
      console.log('Ответ сервера (raw):', responseText)
      
      if (!response.ok) {
        console.error('Ошибка при импорте CSV:', response.status, responseText)
        throw new Error(`Ошибка импорта: ${response.status} ${responseText}`)
      }
      
      // Парсим JSON
      let results
      try {
        results = JSON.parse(responseText)
        console.log('Результаты импорта:', results)
      } catch (parseError) {
        console.error('Ошибка при парсинге ответа JSON:', parseError)
        throw new Error(`Ошибка при обработке ответа сервера: ${parseError.message}`)
      }
      
      // Установка статуса импорта
      setImportStatus({
        success: results.success,
        errors: results.errors,
        newRefs: results.new_refs
      })
      
      // Уведомляем родительский компонент о необходимости обновить данные
      if (onSubmitSuccess) {
        onSubmitSuccess()
      }
      
      setCsvFile(null)
      if (document.getElementById('csv-file-input')) {
        document.getElementById('csv-file-input').value = null
      }
      
    } catch (err) {
      console.error('Ошибка при импорте CSV:', err)
      setError(err.message || 'Произошла ошибка при импорте CSV')
    } finally {
      setIsImporting(false)
    }
  }
  
  const handleDownloadTemplate = () => {
    try {
      console.log('Запрос шаблона CSV...')
      setError(null)
      
      // Используем прямой URL и window.open для скачивания
      window.open(`${API_BASE_URL}/research/export-csv-template`, '_blank');
      
    } catch (err) {
      console.error('Ошибка при скачивании шаблона:', err)
      setError('Не удалось скачать шаблон CSV. Попробуйте позже.')
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
      
      {/* CSV импорт секция */}
      <div className="csv-import-section">
        <h3>Импорт из CSV</h3>
        <div className="csv-controls">
          <button 
            type="button" 
            className="template-button" 
            onClick={handleDownloadTemplate}
          >
            Скачать шаблон CSV
          </button>
          
          <div className="file-upload-container">
            <input
              id="csv-file-input"
              type="file"
              accept=".csv"
              onChange={handleCsvFileChange}
              className="file-input"
            />
            <button 
              type="button" 
              className="import-button" 
              disabled={!csvFile || isImporting}
              onClick={handleCsvImport}
            >
              {isImporting ? 'Импорт...' : 'Импортировать из CSV'}
            </button>
          </div>
        </div>
        
        {importStatus && (
          <div className="import-results">
            <div className="import-summary">
              Успешно импортировано: {importStatus.success} исследований
            </div>
            
            {importStatus.errors && importStatus.errors.length > 0 && (
              <div className="import-errors">
                <h4>Ошибки ({importStatus.errors.length}):</h4>
                <ul>
                  {importStatus.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {importStatus.newRefs && Object.entries(importStatus.newRefs).some(([_, items]) => items.length > 0) && (
              <div className="new-references">
                <h4>Добавлены новые записи в справочники:</h4>
                {importStatus.newRefs.organizations && importStatus.newRefs.organizations.length > 0 && (
                  <div>
                    <strong>Организации:</strong> {importStatus.newRefs.organizations.join(', ')}
                  </div>
                )}
                {importStatus.newRefs.people && importStatus.newRefs.people.length > 0 && (
                  <div>
                    <strong>Люди:</strong> {importStatus.newRefs.people.join(', ')}
                  </div>
                )}
                {importStatus.newRefs.directions && importStatus.newRefs.directions.length > 0 && (
                  <div>
                    <strong>Направления:</strong> {importStatus.newRefs.directions.join(', ')}
                  </div>
                )}
                {importStatus.newRefs.sources && importStatus.newRefs.sources.length > 0 && (
                  <div>
                    <strong>Источники:</strong> {importStatus.newRefs.sources.join(', ')}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="manual-form-section">
        <h3>Или заполните форму вручную</h3>
      </div>
      
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
          <label htmlFor="source_link">Детальная ссылка на источник:</label>
          <input
            id="source_link"
            name="source_link"
            type="url"
            value={formData.source_link}
            onChange={handleInputChange}
            required
            placeholder="https://example.com/article"
          />
        </div>
        
        <div className="form-group">
          <label>Источники:</label>
          <div className="search-box">
            <input
              type="text"
              placeholder="Поиск источников..."
              value={sourceSearch}
              onChange={(e) => setSourceSearch(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="checkbox-group">
            {filterList(references.sources, sourceSearch).map(source => (
              <div key={source.id} className="checkbox-item">
                <input
                  type="checkbox"
                  id={`source-${source.id}`}
                  value={source.id}
                  checked={formData.source_ids.includes(source.id)}
                  onChange={(e) => handleCheckboxChange(e, 'source_ids')}
                />
                <label htmlFor={`source-${source.id}`}>
                  {source.name} {source.url ? <span className="source-url">({source.url})</span> : ''}
                </label>
              </div>
            ))}
            {filterList(references.sources, sourceSearch).length === 0 && (
              <div className="no-results">Ничего не найдено</div>
            )}
          </div>
        </div>
        
        <div className="form-group">
          <label>Направления:</label>
          <div className="search-box">
            <input
              type="text"
              placeholder="Поиск направлений..."
              value={directionSearch}
              onChange={(e) => setDirectionSearch(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="checkbox-group">
            {filterList(references.directions, directionSearch).map(direction => (
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
            {filterList(references.directions, directionSearch).length === 0 && (
              <div className="no-results">Ничего не найдено</div>
            )}
          </div>
        </div>
        
        <div className="form-group">
          <label>Организации:</label>
          <div className="search-box">
            <input
              type="text"
              placeholder="Поиск организаций..."
              value={organizationSearch}
              onChange={(e) => setOrganizationSearch(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="checkbox-group">
            {filterList(references.organizations, organizationSearch).map(organization => (
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
            {filterList(references.organizations, organizationSearch).length === 0 && (
              <div className="no-results">Ничего не найдено</div>
            )}
          </div>
        </div>
        
        <div className="form-group">
          <label>Люди:</label>
          <div className="search-box">
            <input
              type="text"
              placeholder="Поиск людей..."
              value={personSearch}
              onChange={(e) => setPersonSearch(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="checkbox-group">
            {filterList(references.people, personSearch).map(person => (
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
            {filterList(references.people, personSearch).length === 0 && (
              <div className="no-results">Ничего не найдено</div>
            )}
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