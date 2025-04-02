import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../Dashboard.css';

function Dashboard() {
  const [regionStats, setRegionStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Используем относительный URL, который обрабатывается прокси
        console.log('Запрашиваем данные...');
        const response = await axios.get('/api/research/stats/by-region');
        console.log('Полученные данные:', response.data);
        setRegionStats(response.data);
        setError(null);
      } catch (err) {
        console.error('Ошибка загрузки статистики:', err);
        setError(`Не удалось загрузить статистику: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Простое отображение данных без Chart.js для диагностики
  const renderStats = () => {
    if (!regionStats || regionStats.length === 0) {
      return <div className="no-data-message">Нет данных для отображения</div>;
    }

    return (
      <div className="region-stats">
        <h3>Данные получены успешно:</h3>
        <div className="stats-container">
          {regionStats.map((item, index) => (
            <div key={index} className="stat-item">
              <div className="stat-bar" style={{ height: `${item.count * 30}px` }}></div>
              <div className="stat-label">{item.region}</div>
              <div className="stat-value">{item.count}</div>
            </div>
          ))}
        </div>
        
        {/* Отладочная информация */}
        <div className="debug-info">
          <p>Всего регионов: {regionStats.length}</p>
          <pre>{JSON.stringify(regionStats, null, 2)}</pre>
        </div>
      </div>
    );
  };

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Дашборд</h1>
      
      <div className="dashboard-card">
        <h2>Распределение исследований по регионам</h2>
        
        {loading ? (
          <div className="loading-indicator">Загрузка данных...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          renderStats()
        )}
      </div>
    </div>
  );
}

export default Dashboard; 