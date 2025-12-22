
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import React, { useEffect, useRef } from 'react';

const Map: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Карта с кастомным контролем атрибуции
    const map = L.map(mapContainer.current, {
      attributionControl: false
    }).setView([55.7558, 37.6173], 13); // Москва

    // Можно использовать другие OSM-совместимые серверы
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    // ТОЛЬКО OSM атрибуция
    L.control.attribution({
      position: 'bottomright',
      prefix: ''
    })
    .addAttribution('© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>')
    .addTo(map);

    // Добавляем маркер
    L.marker([55.7558, 37.6173])
      .addTo(map)
      .bindPopup('<b>Москва</b><br>Столица России');

    return () => {
      map.remove();
    };
  }, []);

  return (
    <div 
      ref={mapContainer} 
      style={{ 
        height: '500px', 
        width: '100%',
        border: '1px solid #ddd',
        borderRadius: '8px'
      }} 
    />
  );
};

export default Map;