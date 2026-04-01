import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// תיקון לאייקונים של Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function RealMap({ statuses = [], userLocation, onOpenChat, onOpenStatus, radius }) {
  if (!userLocation) return <div className="map-loading">מאתר מיקום...</div>;

  return (
    <div className="map-wrapper">
      <MapContainer 
        center={[userLocation.lat, userLocation.lng]} 
        zoom={14} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        
        {/* מיקום המשתמש */}
        <Circle 
          center={[userLocation.lat, userLocation.lng]} 
          radius={radius} 
          pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.1 }} 
        />
        <Marker position={[userLocation.lat, userLocation.lng]}>
          <Popup>אתה כאן</Popup>
        </Marker>

        {/* סטטוסים מסביב */}
        {(statuses || []).map((status) => (
          <Marker 
            key={status._id || Math.random()} 
            position={[status.lat, status.lng]}
          >
            <Popup>
              <div className="map-popup">
                <strong>{status.nickname}</strong>
                <p>{status.text || status.status}</p>
                <button onClick={() => onOpenChat(status)}>שלח הודעה</button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}