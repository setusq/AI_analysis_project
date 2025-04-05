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

  // Состояние для модального окна подтверждения удаления
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [researchToDelete, setResearchToDelete] = useState(null);

  // Параметры пагинации
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 21,
    totalPages: 1
  })
  
  // Параметры сортировки
  const [sortOption, setSortOption] = useState('default') // default, name-asc, name-desc, date-asc, date-desc
  
  // Выбранные значения фильтров
  const [selectedTechTypes, setSelectedTechTypes] = useState([])
  const [selectedStages, setSelectedStages] = useState([])
  const [selectedRegions, setSelectedRegions] = useState([])
  const [selectedDirections, setSelectedDirections] = useState([])
  
  // Состояние открытых/закрытых фильтров
  const [openFilter, setOpenFilter] = useState(null)
  
  // Ссылки на DOM-элементы фильтров для отслеживания кликов снаружи
  const filterRefs = {
    techType: useRef(null),
    stage: useRef(null),
    region: useRef(null),
    direction: useRef(null)
  }
  
  // Ссылка на модальное окно
  const modalRef = useRef(null)
  
  useEffect(() => {
    fetchResearch()
    fetchReferences()
  }, [])
  
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
  
  // Применяем фильтры при изменении списка исследований или фильтров
  useEffect(() => {
    applyFilters()
  }, [researchList, filters, selectedTechTypes, selectedStages, selectedRegions, selectedDirections])

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
  const handleSelectChange = (e) => {
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
    
    if (selectedTechTypes.length > 0) {
      params.append('technology_type_id', selectedTechTypes.join(','))
    }
    
    if (selectedStages.length > 0) {
      params.append('development_stage_id', selectedStages.join(','))
    }
    
    if (selectedDirections.length > 0) {
      params.append('direction_id', selectedDirections.join(','))
    }
    
    if (selectedRegions.length > 0) {
      params.append('region_id', selectedRegions.join(','))
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
    if (selectedTechTypes.length > 0) {
      filtered = filtered.filter(item => 
        item.technology_type && selectedTechTypes.includes(item.technology_type.id)
      )
    }
    
    // Фильтр по этапу разработки
    if (selectedStages.length > 0) {
      filtered = filtered.filter(item => 
        item.development_stage && selectedStages.includes(item.development_stage.id)
      )
    }
    
    // Фильтр по региону (с учетом регионов организаций)
    if (selectedRegions.length > 0) {
      filtered = filtered.filter(item => 
        // Прямые регионы исследования
        (item.regions && item.regions.some(region => selectedRegions.includes(region.id))) ||
        // Регионы организаций
        (item.organizations && item.organizations.some(org => 
          org.region && selectedRegions.includes(org.region.id)
        ))
      )
    }
    
    // Фильтр по направлению
    if (selectedDirections.length > 0) {
      filtered = filtered.filter(item => 
        item.directions && item.directions.some(direction => selectedDirections.includes(direction.id))
      )
    }
    
    // Обновляем общее количество страниц
    const totalPages = Math.max(1, Math.ceil(filtered.length / pagination.itemsPerPage));
    
    // Если текущая страница больше, чем общее количество страниц, сбрасываем на первую
    if (pagination.currentPage > totalPages) {
      setPagination(prev => ({
        ...prev,
        currentPage: 1,
        totalPages
      }));
    } else {
      setPagination(prev => ({
        ...prev,
        totalPages
      }));
    }
    
    setFilteredList(filtered)
  }
  
  // Обработчик изменения страницы
  const handlePageChange = (pageNumber) => {
    setPagination(prev => ({
      ...prev,
      currentPage: pageNumber
    }));
  }
  
  // Показать модальное окно подтверждения удаления
  const handleConfirmDelete = (research) => {
    setResearchToDelete(research);
    setShowDeleteConfirmModal(true);
    // Блокировка прокрутки основного документа при открытии модального окна
    document.body.style.overflow = 'hidden';
  }
  
  // Отмена удаления
  const handleCancelDelete = () => {
    setShowDeleteConfirmModal(false);
    setResearchToDelete(null);
    // Восстановление прокрутки основного документа
    document.body.style.overflow = 'auto';
  }
  
  // Подтверждение удаления
  const handleDeleteResearch = async () => {
    if (!researchToDelete) return;
    
    try {
      const response = await fetch(`http://localhost:8001/api/research/${researchToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        // Удаляем исследование из списка
        setResearchList(prev => prev.filter(item => item.id !== researchToDelete.id));
        // Закрываем модальное окно
        setShowDeleteConfirmModal(false);
        // Закрываем окно просмотра деталей, если оно открыто
        if (showModal && selectedResearch && selectedResearch.id === researchToDelete.id) {
          handleCloseModal();
        }
        // Сбрасываем данные для удаления
        setResearchToDelete(null);
        // Восстановление прокрутки основного документа
        document.body.style.overflow = 'auto';
      } else {
        const errorData = await response.json();
        console.error('Ошибка при удалении исследования:', errorData);
        alert('Не удалось удалить исследование: ' + (errorData.detail || 'Ошибка сервера'));
      }
    } catch (error) {
      console.error('Ошибка при удалении исследования:', error);
      alert('Не удалось удалить исследование: ' + error.message);
    }
  }
  
  // Сброс фильтров
  const resetFilters = () => {
    setFilters({
      technologyType: '',
      developmentStage: '',
      region: '',
      direction: '',
      searchQuery: ''
    });
    setSelectedTechTypes([]);
    setSelectedStages([]);
    setSelectedRegions([]);
    setSelectedDirections([]);
    setOpenFilter(null);
    setPagination(prev => ({
      ...prev,
      currentPage: 1
    }));
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
  
  // Обработчик изменения чекбоксов
  const handleFilterChange = (filterType, value, isChecked) => {
    switch(filterType) {
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
      case 'region':
        setSelectedRegions(prev => 
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
  
  // Отрисовка чекбоксов для фильтра
  const renderFilterCheckboxes = (items, filterType, selectedItems) => {
    return (
      <div className="filter-dropdown">
        <div className="filter-checkboxes">
          {items.map((item) => (
            <label key={item.id} className="filter-checkbox-label">
              <input
                type="checkbox"
                checked={selectedItems.includes(item.id)}
                onChange={(e) => handleFilterChange(filterType, item.id, e.target.checked)}
              />
              <span>{item.name}</span>
            </label>
          ))}
        </div>
      </div>
    );
  };

  // Получение исследований для текущей страницы
  const getCurrentPageItems = () => {
    // Сортируем список
    let sortedList = [...filteredList];
    
    switch (sortOption) {
      case 'name-asc':
        sortedList.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        sortedList.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'date-asc':
        sortedList.sort((a, b) => {
          const dateA = a.start_date ? new Date(a.start_date) : new Date(0);
          const dateB = b.start_date ? new Date(b.start_date) : new Date(0);
          return dateA - dateB;
        });
        break;
      case 'date-desc':
        sortedList.sort((a, b) => {
          const dateA = a.start_date ? new Date(a.start_date) : new Date(0);
          const dateB = b.start_date ? new Date(b.start_date) : new Date(0);
          return dateB - dateA;
        });
        break;
      default:
        // По умолчанию не сортируем
        break;
    }
    
    const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
    const endIndex = startIndex + pagination.itemsPerPage;
    return sortedList.slice(startIndex, endIndex);
  }
  
  // Обработчик изменения сортировки
  const handleSortChange = (option) => {
    setSortOption(option);
  }
  
  // Компонент пагинации
  const Pagination = () => {
    // Если одна страница, не показываем пагинацию
    if (pagination.totalPages <= 1) return null;
    
    const pageNumbers = [];
    
    // Определяем страницы для отображения (максимум 5)
    let startPage = Math.max(1, pagination.currentPage - 2);
    let endPage = Math.min(pagination.totalPages, startPage + 4);
    
    // Если отображаем менее 5 страниц в конце, корректируем начальную страницу
    if (endPage - startPage < 4 && endPage === pagination.totalPages) {
      startPage = Math.max(1, endPage - 4);
    }
    
    // Заполняем массив номеров страниц
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    return (
      <div className="pagination">
        {/* Кнопка первой страницы */}
        {pagination.currentPage > 1 && (
          <button
            className="page-button first-page"
            onClick={() => handlePageChange(1)}
            title="Первая страница"
          >
            &laquo;
          </button>
        )}
        
        {/* Кнопка предыдущей страницы */}
        {pagination.currentPage > 1 && (
          <button
            className="page-button prev-page"
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            title="Предыдущая страница"
          >
            &lsaquo;
          </button>
        )}
        
        {/* Номера страниц */}
        {pageNumbers.map(number => (
          <button
            key={number}
            className={`page-button ${pagination.currentPage === number ? 'active' : ''}`}
            onClick={() => handlePageChange(number)}
          >
            {number}
          </button>
        ))}
        
        {/* Кнопка следующей страницы */}
        {pagination.currentPage < pagination.totalPages && (
          <button
            className="page-button next-page"
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            title="Следующая страница"
          >
            &rsaquo;
          </button>
        )}
        
        {/* Кнопка последней страницы */}
        {pagination.currentPage < pagination.totalPages && (
          <button
            className="page-button last-page"
            onClick={() => handlePageChange(pagination.totalPages)}
            title="Последняя страница"
          >
            &raquo;
          </button>
        )}
      </div>
    );
  };

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
          <div className="filter-group" ref={filterRefs.techType}>
            <div 
              className={`filter-header ${openFilter === 'techType' ? 'active' : ''}`}
              onClick={() => toggleFilter('techType')}
            >
              <h3>Тип технологии</h3>
              {renderSelectedCount('techType', selectedTechTypes)}
              <span className="dropdown-arrow">{openFilter === 'techType' ? '▲' : '▼'}</span>
            </div>
            {openFilter === 'techType' && references.technologyTypes.length > 0 && 
              renderFilterCheckboxes(references.technologyTypes, 'techType', selectedTechTypes)
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
            {openFilter === 'stage' && references.developmentStages.length > 0 && 
              renderFilterCheckboxes(references.developmentStages, 'stage', selectedStages)
            }
          </div>
          
          <div className="filter-group" ref={filterRefs.region}>
            <div 
              className={`filter-header ${openFilter === 'region' ? 'active' : ''}`}
              onClick={() => toggleFilter('region')}
            >
              <h3>Регион</h3>
              {renderSelectedCount('region', selectedRegions)}
              <span className="dropdown-arrow">{openFilter === 'region' ? '▲' : '▼'}</span>
            </div>
            {openFilter === 'region' && references.regions.length > 0 && 
              renderFilterCheckboxes(references.regions, 'region', selectedRegions)
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
            {openFilter === 'direction' && references.directions.length > 0 && 
              renderFilterCheckboxes(references.directions, 'direction', selectedDirections)
            }
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
        {filteredList.length > pagination.itemsPerPage && (
          <span className="pagination-info">
            (страница {pagination.currentPage} из {pagination.totalPages})
          </span>
        )}
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
        
        <div className="sort-container">
          <select 
            className="sort-select"
            value={sortOption}
            onChange={(e) => handleSortChange(e.target.value)}
            title="Сортировка списка"
          >
            <option value="default">Без сортировки</option>
            <option value="name-asc">По названию (А-Я)</option>
            <option value="name-desc">По названию (Я-А)</option>
            <option value="date-asc">По дате (сначала старые)</option>
            <option value="date-desc">По дате (сначала новые)</option>
          </select>
        </div>
        
        <div className="spacer"></div>
        
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
          {getCurrentPageItems().map(research => (
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
            className="modal-content" 
            onClick={e => e.stopPropagation()} 
            tabIndex={0}
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            onScroll={(e) => e.stopPropagation()}
            style={{
              width: '99vw',
              maxWidth: '99vw',
              backgroundColor: 'white',
              padding: '25px',
              borderRadius: '8px',
              overflowY: 'scroll',
              maxHeight: '90vh',
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
              <button 
                className="delete-button"
                onClick={() => handleConfirmDelete(selectedResearch)}
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
      
      <Pagination />
      
      {/* Модальное окно подтверждения удаления */}
      {showDeleteConfirmModal && researchToDelete && (
        <div className="modal-overlay" onClick={handleCancelDelete} style={{
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
            className="confirm-modal" 
            onClick={e => e.stopPropagation()}
            style={{
              width: '400px',
              backgroundColor: 'white',
              padding: '25px',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
            }}
          >
            <h3>Подтверждение удаления</h3>
            <p>Вы действительно хотите удалить исследование "{researchToDelete.name}"?</p>
            <p className="warning-text">Это действие невозможно отменить.</p>
            
            <div className="confirm-actions">
              <button 
                className="cancel-button"
                onClick={handleCancelDelete}
              >
                Отмена
              </button>
              <button 
                className="confirm-delete-button"
                onClick={handleDeleteResearch}
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ResearchList 