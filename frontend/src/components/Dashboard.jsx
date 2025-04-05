import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import '../Dashboard.css';

function Dashboard() {
  // Данные гистограмм
  const [regionStats, setRegionStats] = useState([]);
  const [techTypeStats, setTechTypeStats] = useState([]);
  const [stageStats, setStageStats] = useState([]);
  const [directionStats, setDirectionStats] = useState([]);
  
  // Данные для фильтров
  const [allRegions, setAllRegions] = useState([]);
  const [allTechTypes, setAllTechTypes] = useState([]);
  const [allStages, setAllStages] = useState([]);
  const [allDirections, setAllDirections] = useState([]);
  
  // Выбранные значения фильтров
  const [selectedRegions, setSelectedRegions] = useState([]);
  const [selectedTechTypes, setSelectedTechTypes] = useState([]);
  const [selectedStages, setSelectedStages] = useState([]);
  const [selectedDirections, setSelectedDirections] = useState([]);
  
  // Состояние открытых/закрытых фильтров
  const [openFilter, setOpenFilter] = useState(null);
  
  // Состояние модального окна
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState([]);
  const [modalTitle, setModalTitle] = useState('');
  const [modalSubtitle, setModalSubtitle] = useState('');
  
  // Ссылки на DOM-элементы фильтров для отслеживания кликов снаружи
  const filterRefs = {
    region: useRef(null),
    techType: useRef(null),
    stage: useRef(null),
    direction: useRef(null)
  };
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Массив цветов для баров в сине-голубой-серой гамме
  const barColors = [
    '#4285F4', // синий
    '#5E97F6', // голубой
    '#7BAAF7', // светло-голубой
    '#A1C2FA', // очень светло-голубой
    '#3367D6', // темно-синий
    '#2A56C6', // насыщенный синий
    '#5C6BC0', // индиго
    '#7986CB', // светлый индиго
    '#9FA8DA', // очень светлый индиго
    '#42A5F5', // голубой
    '#64B5F6', // светло-голубой
    '#90CAF9', // очень светло-голубой
    '#607D8B', // сине-серый
    '#78909C', // светло-сине-серый
    '#90A4AE', // очень светло-сине-серый
  ];

  // Обработчик клика вне фильтра для его закрытия
  useEffect(() => {
    function handleClickOutside(event) {
      if (openFilter) {
        const currentRef = filterRefs[openFilter];
        if (currentRef && currentRef.current && !currentRef.current.contains(event.target)) {
          setOpenFilter(null);
        }
      }
    }
    
    // Добавляем обработчик события
    document.addEventListener('mousedown', handleClickOutside);
    
    // Очищаем обработчик при размонтировании компонента
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openFilter]);

  // Загрузка исходных данных
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('Начало загрузки данных...');
        
        // Получаем данные для всех четырех гистограмм
        let regionData = [], techTypeData = [], stageData = [], directionData = [];
        
        try {
          const regionResponse = await axios.get('/api/research/stats/by-region');
          console.log('Регионы получены:', regionResponse.data);
          regionData = regionResponse.data || [];
        } catch (regionError) {
          console.error('Ошибка загрузки регионов:', regionError);
        }
        
        try {
          const techTypeResponse = await axios.get('/api/research/stats/by-tech-type');
          console.log('Типы технологий получены:', techTypeResponse.data);
          techTypeData = techTypeResponse.data || [];
        } catch (techError) {
          console.error('Ошибка загрузки типов технологий:', techError);
        }
        
        try {
          const stageResponse = await axios.get('/api/research/stats/by-stage');
          console.log('Этапы разработки получены:', stageResponse.data);
          stageData = stageResponse.data || [];
        } catch (stageError) {
          console.error('Ошибка загрузки этапов разработки:', stageError);
        }
        
        try {
          const directionResponse = await axios.get('/api/research/stats/by-direction');
          console.log('Направления получены:', directionResponse.data);
          directionData = directionResponse.data || [];
        } catch (directionError) {
          console.error('Ошибка загрузки направлений:', directionError);
        }
        
        setRegionStats(regionData);
        setTechTypeStats(techTypeData);
        setStageStats(stageData);
        setDirectionStats(directionData);
        
        // Заполняем список значений для фильтров
        setAllRegions(regionData.map(item => item.region));
        setAllTechTypes(techTypeData.map(item => item.tech_type));
        setAllStages(stageData.map(item => item.stage));
        setAllDirections(directionData.map(item => item.direction));
        
        setError(null);
      } catch (err) {
        console.error('Детальная ошибка загрузки статистики:', err.response?.data || err.message, err.stack);
        setError(`Не удалось загрузить статистику: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  
  // Обновление данных при изменении фильтров
  useEffect(() => {
    const fetchFilteredData = async () => {
      if (loading) return;
      
      try {
        setLoading(true);
        
        // Формируем параметры запросов с учетом фильтров
        const queryParams = new URLSearchParams();
        
        if (selectedRegions.length > 0) {
          queryParams.append('regions', selectedRegions.join(','));
        }
        
        if (selectedTechTypes.length > 0) {
          queryParams.append('tech_types', selectedTechTypes.join(','));
        }
        
        if (selectedStages.length > 0) {
          queryParams.append('stages', selectedStages.join(','));
        }
        
        if (selectedDirections.length > 0) {
          queryParams.append('directions', selectedDirections.join(','));
        }
        
        const queryString = queryParams.toString();
        const urlSuffix = queryString ? `?${queryString}` : '';
        
        // Получаем отфильтрованные данные
        let regionData = [], techTypeData = [], stageData = [], directionData = [];
        
        try {
          const regionResponse = await axios.get(`/api/research/stats/by-region${urlSuffix}`);
          regionData = regionResponse.data || [];
        } catch (regionError) {
          console.error('Ошибка загрузки фильтрованных регионов:', regionError);
        }
        
        try {
          const techTypeResponse = await axios.get(`/api/research/stats/by-tech-type${urlSuffix}`);
          techTypeData = techTypeResponse.data || [];
        } catch (techError) {
          console.error('Ошибка загрузки фильтрованных типов технологий:', techError);
        }
        
        try {
          const stageResponse = await axios.get(`/api/research/stats/by-stage${urlSuffix}`);
          stageData = stageResponse.data || [];
        } catch (stageError) {
          console.error('Ошибка загрузки фильтрованных этапов разработки:', stageError);
        }
        
        try {
          const directionResponse = await axios.get(`/api/research/stats/by-direction${urlSuffix}`);
          directionData = directionResponse.data || [];
        } catch (directionError) {
          console.error('Ошибка загрузки фильтрованных направлений:', directionError);
        }
        
        setRegionStats(regionData);
        setTechTypeStats(techTypeData);
        setStageStats(stageData);
        setDirectionStats(directionData);
        
        setError(null);
      } catch (err) {
        console.error('Ошибка загрузки отфильтрованных данных:', err);
        setError(`Не удалось загрузить отфильтрованные данные: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    // Вызываем обновление данных только если выбраны какие-то фильтры
    if (selectedRegions.length > 0 || selectedTechTypes.length > 0 || 
        selectedStages.length > 0 || selectedDirections.length > 0) {
      fetchFilteredData();
    } else {
      // Если все фильтры сброшены, загружаем исходные данные
      const fetchInitialData = async () => {
        try {
          setLoading(true);
          
          // Получаем данные для всех четырех гистограмм
          let regionData = [], techTypeData = [], stageData = [], directionData = [];
          
          try {
            const regionResponse = await axios.get('/api/research/stats/by-region');
            regionData = regionResponse.data || [];
          } catch (regionError) {
            console.error('Ошибка загрузки регионов при сбросе фильтров:', regionError);
          }
          
          try {
            const techTypeResponse = await axios.get('/api/research/stats/by-tech-type');
            techTypeData = techTypeResponse.data || [];
          } catch (techError) {
            console.error('Ошибка загрузки типов технологий при сбросе фильтров:', techError);
          }
          
          try {
            const stageResponse = await axios.get('/api/research/stats/by-stage');
            stageData = stageResponse.data || [];
          } catch (stageError) {
            console.error('Ошибка загрузки этапов разработки при сбросе фильтров:', stageError);
          }
          
          try {
            const directionResponse = await axios.get('/api/research/stats/by-direction');
            directionData = directionResponse.data || [];
          } catch (directionError) {
            console.error('Ошибка загрузки направлений при сбросе фильтров:', directionError);
          }
          
          setRegionStats(regionData);
          setTechTypeStats(techTypeData);
          setStageStats(stageData);
          setDirectionStats(directionData);
          
          setError(null);
        } catch (err) {
          console.error('Ошибка загрузки данных при сбросе фильтров:', err);
          setError(`Не удалось загрузить данные: ${err.message}`);
        } finally {
          setLoading(false);
        }
      };
      
      fetchInitialData();
    }
  }, [selectedRegions, selectedTechTypes, selectedStages, selectedDirections]);
  
  // Обработчики изменения фильтров
  const handleFilterChange = (filterType, value, isChecked) => {
    switch(filterType) {
      case 'region':
        setSelectedRegions(prev => 
          isChecked ? [...prev, value] : prev.filter(item => item !== value)
        );
        break;
      case 'techType':
        setSelectedTechTypes(prev => 
          isChecked ? [...prev, value] : prev.filter(item => item !== value)
        );
        break;
      case 'stage':
        setSelectedStages(prev => 
          isChecked ? [...prev, value] : prev.filter(item => item !== value)
        );
        break;
      case 'direction':
        setSelectedDirections(prev => 
          isChecked ? [...prev, value] : prev.filter(item => item !== value)
        );
        break;
      default:
        break;
    }
  };
  
  // Переключение видимости фильтра
  const toggleFilter = (filterName) => {
    setOpenFilter(openFilter === filterName ? null : filterName);
  };
  
  // Отображение выбранных фильтров
  const renderSelectedCount = (filterType, selectedItems) => {
    if (!selectedItems || selectedItems.length === 0) {
      return <span className="placeholder-text">Выберите значения</span>;
    }
    
    return (
      <span className="selected-count">
        Выбрано: {selectedItems.length}
      </span>
    );
  };
  
  // Сброс всех фильтров
  const handleResetFilters = () => {
    setSelectedRegions([]);
    setSelectedTechTypes([]);
    setSelectedStages([]);
    setSelectedDirections([]);
    setOpenFilter(null);
    
    // После сброса фильтров данные будут загружены через useEffect,
    // который отслеживает изменения выбранных фильтров
  };
  
  // Открытие гистограммы в модальном окне
  const openModal = (data, title, subtitle) => {
    setModalData(data);
    setModalTitle(title);
    setModalSubtitle(subtitle);
    setModalOpen(true);
    
    // Блокировка прокрутки страницы при открытом модальном окне
    document.body.style.overflow = 'hidden';
  };
  
  // Закрытие модального окна
  const closeModal = () => {
    setModalOpen(false);
    setModalData([]);
    setModalTitle('');
    setModalSubtitle('');
    
    // Разблокировка прокрутки страницы
    document.body.style.overflow = 'auto';
  };

  // Отрисовка чекбоксов для фильтра
  const renderFilterCheckboxes = (items, filterType, selectedItems) => {
    return (
      <div className="filter-dropdown">
        <div className="filter-checkboxes">
          {items.map((item, index) => (
            <label key={index} className="filter-checkbox-label">
              <input
                type="checkbox"
                checked={selectedItems.includes(item)}
                onChange={(e) => handleFilterChange(filterType, item, e.target.checked)}
              />
              <span>{item}</span>
            </label>
          ))}
        </div>
      </div>
    );
  };

  // Функция для рендеринга гистограмм
  const renderChart = (data, title) => {
    if (!data || data.length === 0) {
      return <div className="no-data-message">Нет данных для отображения</div>;
    }

    // Находим максимальное значение для масштабирования
    const maxCount = Math.max(...data.map(item => item.count || 0));
    // Коэффициент масштабирования (максимальная высота бара - 200px)
    const scale = maxCount > 0 ? 200 / maxCount : 0;

    return (
      <div className="stats-block">
        <h3>{title}</h3>
        <div className="stats-container-wrapper">
          <div 
            className="stats-container"
            onClick={() => openModal(data, title, "")}
          >
            {data.map((item, index) => {
              const fieldName = Object.keys(item).find(key => key !== 'count');
              const fieldValue = item[fieldName] || 'Н/Д';
              // Проверяем наличие значений
              const count = item.count || 0;
              // Масштабируем высоту бара относительно максимального значения
              const barHeight = Math.max(count * scale, 5); // Минимальная высота 5px
              // Выбираем цвет для бара
              const colorIndex = index % barColors.length;
              const barColor = barColors[colorIndex];
              
              return (
                <div key={index} className="stat-item">
                  <div 
                    className="stat-bar" 
                    style={{ 
                      height: `${barHeight}px`,
                      backgroundColor: barColor 
                    }}
                  ></div>
                  <div className="stat-label">{fieldValue}</div>
                  <div className="stat-value" style={{ color: barColor }}>{count}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };
  
  // Функция для рендеринга гистограммы в модальном окне
  const renderModalChart = (data, title) => {
    if (!data || data.length === 0) {
      return <div className="no-data-message">Нет данных для отображения</div>;
    }

    // Находим максимальное значение для масштабирования
    const maxCount = Math.max(...data.map(item => item.count || 0));
    // Коэффициент масштабирования (максимальная высота бара - 250px)
    const scale = maxCount > 0 ? 250 / maxCount : 0;

    return (
      <div className="modal-stats-container">
        {data.map((item, index) => {
          const fieldName = Object.keys(item).find(key => key !== 'count');
          const fieldValue = item[fieldName] || 'Н/Д';
          const count = item.count || 0;
          // Масштабируем высоту бара относительно максимального значения
          const barHeight = Math.max(count * scale, 3); // Минимальная высота 3px
          // Выбираем цвет для бара
          const colorIndex = index % barColors.length;
          const barColor = barColors[colorIndex];
          
          return (
            <div key={index} className="modal-stat-item">
              <div 
                className="modal-stat-bar" 
                style={{ 
                  height: `${barHeight}px`,
                  backgroundColor: barColor 
                }}
              ></div>
              <div className="modal-stat-label">{fieldValue}</div>
              <div className="modal-stat-value" style={{ color: barColor }}>{count}</div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Дашборд</h1>
      
      {loading && !allRegions.length ? (
        <div className="loading-indicator">Загрузка данных...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <>
          <div className="dashboard-filters">
            <h2>Фильтры</h2>
            <div className="filters-grid">
              <div className="filter-group" ref={filterRefs.region}>
                <div 
                  className={`filter-header ${openFilter === 'region' ? 'active' : ''}`}
                  onClick={() => toggleFilter('region')}
                >
                  <h3>Регион</h3>
                  {renderSelectedCount('region', selectedRegions)}
                  <span className="dropdown-arrow">{openFilter === 'region' ? '▲' : '▼'}</span>
                </div>
                {openFilter === 'region' && allRegions.length > 0 && 
                  renderFilterCheckboxes(allRegions, 'region', selectedRegions)
                }
              </div>
              
              <div className="filter-group" ref={filterRefs.techType}>
                <div 
                  className={`filter-header ${openFilter === 'techType' ? 'active' : ''}`}
                  onClick={() => toggleFilter('techType')}
                >
                  <h3>Тип технологии</h3>
                  {renderSelectedCount('techType', selectedTechTypes)}
                  <span className="dropdown-arrow">{openFilter === 'techType' ? '▲' : '▼'}</span>
                </div>
                {openFilter === 'techType' && allTechTypes.length > 0 && 
                  renderFilterCheckboxes(allTechTypes, 'techType', selectedTechTypes)
                }
              </div>
              
              <div className="filter-group" ref={filterRefs.stage}>
                <div 
                  className={`filter-header ${openFilter === 'stage' ? 'active' : ''}`}
                  onClick={() => toggleFilter('stage')}
                >
                  <h3>Этап разработки</h3>
                  {renderSelectedCount('stage', selectedStages)}
                  <span className="dropdown-arrow">{openFilter === 'stage' ? '▲' : '▼'}</span>
                </div>
                {openFilter === 'stage' && allStages.length > 0 && 
                  renderFilterCheckboxes(allStages, 'stage', selectedStages)
                }
              </div>
              
              <div className="filter-group" ref={filterRefs.direction}>
                <div 
                  className={`filter-header ${openFilter === 'direction' ? 'active' : ''}`}
                  onClick={() => toggleFilter('direction')}
                >
                  <h3>Направление</h3>
                  {renderSelectedCount('direction', selectedDirections)}
                  <span className="dropdown-arrow">{openFilter === 'direction' ? '▲' : '▼'}</span>
                </div>
                {openFilter === 'direction' && allDirections.length > 0 && 
                  renderFilterCheckboxes(allDirections, 'direction', selectedDirections)
                }
              </div>
            </div>
            
            <div className="filter-actions">
              <button 
                className="reset-filters-btn" 
                onClick={handleResetFilters}
                disabled={!selectedRegions.length && !selectedTechTypes.length && 
                          !selectedStages.length && !selectedDirections.length}
              >
                Сбросить фильтры
              </button>
            </div>
          </div>
          
          {loading ? (
            <div className="loading-indicator">Обновление данных...</div>
          ) : (
            <div className="dashboard-grid">
              <div className="dashboard-card">
                <h2>Распределение исследований по регионам</h2>
                {renderChart(regionStats, 'Регионы')}
              </div>
              
              <div className="dashboard-card">
                <h2>Распределение по типу технологии</h2>
                {renderChart(techTypeStats, 'Типы технологий')}
              </div>
              
              <div className="dashboard-card">
                <h2>Распределение по этапам разработки</h2>
                {renderChart(stageStats, 'Этапы разработки')}
              </div>
              
              <div className="dashboard-card">
                <h2>Распределение по направлениям</h2>
                {renderChart(directionStats, 'Направления')}
              </div>
            </div>
          )}
          
          {/* Модальное окно для отображения гистограммы на весь экран */}
          {modalOpen && (
            <div className="modal-overlay" onClick={closeModal} style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 1000
            }}>
              <div 
                onClick={(e) => e.stopPropagation()}
                style={{ 
                  backgroundColor: 'white',
                  width: '85vw',
                  height: '80vh',
                  margin: '0 auto',
                  borderRadius: '8px',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '15px 10px',
                  position: 'relative',
                  boxSizing: 'border-box'
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingBottom: '15px',
                  borderBottom: '1px solid #eee',
                  marginBottom: '15px'
                }}>
                  <h2 style={{
                    margin: 0,
                    fontSize: '24px',
                    color: '#333'
                  }}>{modalTitle}</h2>
                  <button 
                    onClick={closeModal}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '28px',
                      cursor: 'pointer',
                      color: '#999'
                    }}
                  >&times;</button>
                </div>
                <div style={{ 
                  flexGrow: 1,
                  overflowX: 'auto',
                  width: '100%',
                  padding: '0',
                  boxSizing: 'border-box',
                  display: 'flex',
                  justifyContent: 'center'
                }}>
                  <div style={{
                    display: 'inline-block',
                    maxWidth: '100%'
                  }}>
                    {renderModalChart(modalData, modalTitle)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Dashboard; 