import React, { useState, useEffect, useMemo } from 'react';
import RealMap from './components/RealMap';
import WelcomePage from './WelcomePage';
import TopBar from './components/TopBar';
import StatusArea from './components/StatusArea';
import StatusDetails from './components/StatusDetails';
import ChatWindow from './components/ChatWindow';
import './index.css';

function App() {
  const [entered, setEntered] = useState(false);
  const [currentUser, setCurrentUser] = useState({ nickname: '', avatar: '👤' });
  const [userLocation, setUserLocation] = useState(null);
  const [statuses, setStatuses] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [activeChat, setActiveChat] = useState(null);
  const [mapCenterKey, setMapCenterKey] = useState(0);

  // States לחיבור הממשק - רדיוס מוגדר במטרים לפי NavTabs
  const [radius, setRadius] = useState(1500); 
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("map");

  const syncWithServer = async (lat, lng, statusUpdate = null) => {
    try {
      const response = await fetch('http://localhost:3001/api/user/location', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname: currentUser.nickname || 'אורח', lat, lng, ...statusUpdate }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.allUsers) {
          setStatuses(data.allUsers.map(u => ({
            ...u,
            lat: u.location?.coordinates[1],
            lng: u.location?.coordinates[0]
          })));
        }
      }
    } catch (e) { console.error("Sync error:", e); }
  };

  const handlePlaceSelect = (place) => {
    // Nominatim מחזיר lon, אנחנו צריכים להמיר ל-lng
    const newLoc = { lat: parseFloat(place.lat), lng: parseFloat(place.lon) };
    setUserLocation(newLoc);
    setMapCenterKey(prev => prev + 1); 
  };

  useEffect(() => {
    if (!entered) return;
    navigator.geolocation.getCurrentPosition((p) => {
      const loc = { lat: p.coords.latitude, lng: p.coords.longitude };
      setUserLocation(loc);
      syncWithServer(loc.lat, loc.lng);
    }, (err) => console.error("Geo error:", err), { enableHighAccuracy: true });
  }, [entered]);

  const filteredStatuses = useMemo(() => {
    if (!userLocation) return [];
    return statuses.filter(s => {
      if (!s.lat || !s.lng) return false;
      const R = 6371; // רדיוס כדור הארץ בק"מ
      const dLat = (s.lat - userLocation.lat) * Math.PI / 180;
      const dLon = (s.lng - userLocation.lng) * Math.PI / 180;
      const a = Math.sin(dLat/2)**2 + 
                Math.cos(userLocation.lat * Math.PI / 180) * Math.cos(s.lat * Math.PI / 180) * Math.sin(dLon/2)**2;
      const distanceInKm = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      
      // המרה לק"מ כי הרדיוס שלנו הוא במטרים (למשל 1500מ' = 1.5ק"מ)
      return distanceInKm <= (radius / 1000);
    });
  }, [statuses, userLocation, radius]);

  if (!entered) return <WelcomePage onEnter={(u) => { setCurrentUser(u); setEntered(true); }} />;

  return (
    <div className="app-container">
      <TopBar 
  // נתונים (States)
  currentUser={currentUser}
  activeTab={activeTab}
  searchTerm={searchTerm}
  radius={radius}
  
  // פונקציות (שיניתי את השמות שיתאימו ב-100% ל-TopBar.jsx שלך)
  onChangeTab={setActiveTab}
  onSearchChange={setSearchTerm}
  setRadius={setRadius} // ב-TopBar שלך זה נקרא setRadius
  onPlaceSelect={handlePlaceSelect}
  
  // פעולות כפתורים
  onGoHome={() => { 
    setSearchTerm(""); 
    setActiveTab("map"); 
    setMapCenterKey(k => k + 1); 
  }}
  onClear={() => {
    setSearchTerm("");
    // אם יש פונקציה שמנקה תוצאות חיפוש במפה, תוסיף אותה כאן
  }}
  onGetLocation={(l) => { 
    setUserLocation({ lat: l.latitude, lng: l.longitude }); 
    setMapCenterKey(k => k + 1); 
  }}
  
  // הוספת פונקציות חסרות כדי למנוע קריסה
  onOpenProfile={() => console.log("Profile clicked")}
  onOpenChat={() => console.log("Chat clicked")}
/>
      
      <main className="main-content">
        {activeTab === "map" ? (
          <RealMap 
            key={mapCenterKey}
            statuses={filteredStatuses}
            userLocation={userLocation}
            onOpenChat={setActiveChat}
            onOpenStatus={setSelectedStatus}
            radius={radius}
          />
        ) : (
          <div className="list-view-placeholder" style={{ padding: '20px' }}>
             {/* כאן תבוא רשימת הסטטוסים במידה ויש */}
          </div>
        )}
        
        <StatusArea 
          onPostStatus={(s) => syncWithServer(userLocation.lat, userLocation.lng, s)} 
          radius={radius} 
          setRadius={setRadius} 
        />
      </main>

      {selectedStatus && <StatusDetails status={selectedStatus} onClose={() => setSelectedStatus(null)} onOpenChat={setActiveChat} />}
      {activeChat && <ChatWindow chat={activeChat} onClose={() => setActiveChat(null)} />}
    </div>
  );
}

export default App;