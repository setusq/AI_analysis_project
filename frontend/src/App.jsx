import { useState, useEffect } from 'react'
import './App.css'
import ResearchForm from './ResearchForm'
import ReferenceManager from './ReferenceManager'
import ResearchList from './ResearchList'
import Dashboard from './components/Dashboard'

// API базовый URL
const API_BASE_URL = 'http://localhost:8001/api'

function App() {
  const [activeTab, setActiveTab] = useState('home')
  const [references, setReferences] = useState({
    technologyTypes: [],
    developmentStages: [],
    regions: [],
    organizations: [],
    people: [],
    directions: [],
    sources: []
  })
  const [editingResearch, setEditingResearch] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchReferences() {
      setIsLoading(true)
      setError(null)
      
      try {
        // Получаем данные из всех справочников
        const technologyTypesRes = await fetch(`${API_BASE_URL}/references/technology-types`)
        const developmentStagesRes = await fetch(`${API_BASE_URL}/references/development-stages`)
        const regionsRes = await fetch(`${API_BASE_URL}/references/regions`)
        const organizationsRes = await fetch(`${API_BASE_URL}/references/organizations`)
        const peopleRes = await fetch(`${API_BASE_URL}/references/people`)
        const directionsRes = await fetch(`${API_BASE_URL}/references/directions`)
        const sourcesRes = await fetch(`${API_BASE_URL}/references/sources`)
        
        // Проверяем ответы и получаем JSON данные
        if (!technologyTypesRes.ok) throw new Error(`Ошибка загрузки типов технологий: ${technologyTypesRes.status}`)
        if (!developmentStagesRes.ok) throw new Error(`Ошибка загрузки этапов разработки: ${developmentStagesRes.status}`)
        if (!regionsRes.ok) throw new Error(`Ошибка загрузки регионов: ${regionsRes.status}`)
        if (!organizationsRes.ok) throw new Error(`Ошибка загрузки организаций: ${organizationsRes.status}`)
        if (!peopleRes.ok) throw new Error(`Ошибка загрузки людей: ${peopleRes.status}`)
        if (!directionsRes.ok) throw new Error(`Ошибка загрузки направлений: ${directionsRes.status}`)
        if (!sourcesRes.ok) throw new Error(`Ошибка загрузки источников: ${sourcesRes.status}`)
        
        // Получаем JSON данные из ответов
        const technologyTypes = await technologyTypesRes.json()
        const developmentStages = await developmentStagesRes.json()
        const regions = await regionsRes.json()
        const organizations = await organizationsRes.json()
        const people = await peopleRes.json()
        const directions = await directionsRes.json()
        const sources = await sourcesRes.json()
        
        console.log('Загружены данные справочников:', {
          technologyTypes, developmentStages, regions, 
          organizations, people, directions, sources
        })
        
        // Устанавливаем данные в состояние
        setReferences({
          technologyTypes,
          developmentStages,
          regions,
          organizations,
          people,
          directions,
          sources
        })
      } catch (err) {
        console.error('Ошибка при загрузке справочных данных:', err)
        setError(err.message)
        
        // Если произошла ошибка, используем пустые массивы
        setReferences({
          technologyTypes: [],
          developmentStages: [],
          regions: [],
          organizations: [],
          people: [],
          directions: [],
          sources: []
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchReferences()
  }, [])

  const handleEditResearch = (research) => {
    setEditingResearch(research)
    setActiveTab('add-research')
  }

  const handleFormSubmitSuccess = () => {
    setEditingResearch(null)
    setActiveTab('home')
  }

  const getFormTitle = () => {
    return editingResearch ? 'Редактирование исследования' : 'Добавление нового исследования'
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab)
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Research Tracker</h1>
        <nav className="app-nav">
          <button 
            className={activeTab === 'home' ? 'active' : ''} 
            onClick={() => handleTabChange('home')}
          >
            Главная
          </button>
          <button 
            className={activeTab === 'dashboard' ? 'active' : ''} 
            onClick={() => handleTabChange('dashboard')}
          >
            Дашборд
          </button>
          <button 
            className={activeTab === 'add-research' ? 'active' : ''} 
            onClick={() => {
              setEditingResearch(null)
              handleTabChange('add-research')
            }}
          >
            Добавить исследование
          </button>
          <button 
            className={activeTab === 'references' ? 'active' : ''} 
            onClick={() => handleTabChange('references')}
          >
            Справочники
          </button>
        </nav>
      </header>
      
      <main className="app-content">
        {isLoading ? (
          <div className="loading-spinner">Загрузка данных...</div>
        ) : error ? (
          <div className="error-message">
            Произошла ошибка: {error}
          </div>
        ) : (
          <>
            {activeTab === 'home' && (
              <div className="home-content">
                <ResearchList onEditResearch={handleEditResearch} />
              </div>
            )}
            
            {activeTab === 'dashboard' && (
              <div className="dashboard-content">
                <Dashboard />
              </div>
            )}
            
            {activeTab === 'add-research' && (
              <div className="add-research-content">
                <h2>{getFormTitle()}</h2>
                <ResearchForm 
                  references={references} 
                  editingResearch={editingResearch}
                  onSubmitSuccess={handleFormSubmitSuccess}
                />
              </div>
            )}
            
            {activeTab === 'references' && (
              <div className="references-content">
                <ReferenceManager />
              </div>
            )}
          </>
        )}
      </main>
      
      <footer>
        <p>&copy; 2025 R&D Analytica</p>
      </footer>
    </div>
  )
}

export default App 