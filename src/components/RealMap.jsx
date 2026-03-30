import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// פונקציה למרכוז המפה
function ChangeView({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center.lat && center.lng) {
      map.flyTo([center.lat, center.lng], map.getZoom(), { duration: 1.5 });
    }
  }, [center, map]);
  return null;
}

export default function RealMap({ userLocation, statuses, onOpenChat, onOpenStatus, radius }) {
  const defaultCenter = [32.0853, 34.7818];
  const hasLocation = userLocation && userLocation.lat && userLocation.lng;
  const center = hasLocation ? [userLocation.lat, userLocation.lng] : defaultCenter;

  return (
    <div className="map-wrapper" style={{ height: '100%', width: '100%' }}>
      <MapContainer 
        center={center} 
        zoom={14} 
        style={{ height: '100%', width: '100%' }}
      >
        <ChangeView center={userLocation} />

        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />

        {hasLocation && (
          <>
            {/* הנקודה הכחולה המדויקת של המשתמש */}
            <Circle
              center={[userLocation.lat, userLocation.lng]}
              radius={15} // רדיוס קטן במטרים לנקודת המרכז
              pathOptions={{
                fillColor: '#2563eb',
                fillOpacity: 1,
                color: 'white',
                weight: 2
              }}
            />

            {/* עיגול הרדיוס המשתנה - זה מה שחיפשת */}
            <Circle
              center={[userLocation.lat, userLocation.lng]}
              radius={radius} // כאן אנחנו משתמשים ברדיוס מה-Props (במטרים!)
              pathOptions={{
                fillColor: '#2563eb',
                fillOpacity: 0.15, // שקוף עדין
                color: '#2563eb',
                weight: 1,
                dashArray: '5, 10' // קו מקווקו למראה "חיפוש"
              }}
            />
          </>
        )}

        {statuses.map((status) => (
          <Marker 
            key={status._id || status.id} 
            position={[status.lat, status.lng]}
            eventHandlers={{ click: () => onOpenStatus(status) }}
          >
            <Popup>
              <div className="status-popup">
                <strong>{status.nickname}</strong>
                <p>{status.text}</p>
                <button onClick={() => onOpenChat(status)}>צ'אט</button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}