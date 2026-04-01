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

  const [radius, setRadius] = useState(1500); 
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("map");

  const syncWithServer = async (lat, lng, statusUpdate = null) => {
    try {
      // יצירת אובייקט הבקשה לפי הדרישות של ה-Schema בשרת
      const bodyPayload = {
        nickname: currentUser.nickname || 'אורח',
        lat: parseFloat(lat),
        lng: parseFloat(lng)
      };

      // אם נשלח סטטוס חדש, מוסיפים אותו למבנה שהשרת מצפה לו
      if (statusUpdate) {
        bodyPayload.statusText = statusUpdate.text; // וודא שזה השם ב-Schema שלך (למשל statusText או content)
        bodyPayload.statusType = statusUpdate.type || 'general';
      }

      const response = await fetch('http://localhost:5000/api/user/location', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload),
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
      } else {
        const err = await response.json();
        console.error("Validation Error from Server:", err);
      }
    } catch (e) { console.error("Sync error:", e); }
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
    if (!userLocation || !statuses) return [];
    return statuses.filter(s => {
      if (!s.lat || !s.lng) return false;
      const R = 6371; 
      const dLat = (s.lat - userLocation.lat) * Math.PI / 180;
      const dLon = (s.lng - userLocation.lng) * Math.PI / 180;
      const a = Math.sin(dLat/2)**2 + Math.cos(userLocation.lat * Math.PI / 180) * Math.cos(s.lat * Math.PI / 180) * Math.sin(dLon/2)**2;
      return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))) <= (radius / 1000);
    });
  }, [statuses, userLocation, radius]);

  if (!entered) return <WelcomePage onEnter={(u) => { setCurrentUser(u); setEntered(true); }} />;

  return (
    <div className="app-container">
      <TopBar 
        currentUser={currentUser}
        activeTab={activeTab}
        searchTerm={searchTerm}
        radius={radius}
        onChangeTab={setActiveTab}
        onSearchChange={setSearchTerm}
        setRadius={setRadius}
        onPlaceSelect={(place) => {
          const loc = { lat: parseFloat(place.lat), lng: parseFloat(place.lon) };
          setUserLocation(loc);
          setMapCenterKey(prev => prev + 1);
          syncWithServer(loc.lat, loc.lng);
        }}
        onGoHome={() => { 
          setSearchTerm(""); 
          setActiveTab("map"); 
          setMapCenterKey(k => k + 1); 
        }}
        onGetLocation={(l) => { 
          const loc = { lat: l.latitude, lng: l.longitude };
          setUserLocation(loc); 
          setMapCenterKey(k => k + 1); 
          syncWithServer(loc.lat, loc.lng);
        }}
      />
      
      <main className="main-content">
  <RealMap 
    key={mapCenterKey}
    statuses={filteredStatuses}
    userLocation={userLocation}
    onOpenChat={setActiveChat}
    onOpenStatus={setSelectedStatus}
    radius={radius}
  />
  {/* הסטטוס אריאה יושב פה תמיד, ה-CSS דואג לחלוקה/שקיפות */}
  <StatusArea 
    activeTab={activeTab} 
    statuses={filteredStatuses}
    userLocation={userLocation}
    onAddStatus={(s) => syncWithServer(userLocation.lat, userLocation.lng, s)} 
    onOpenChat={setActiveChat}
    onOpenStatus={setSelectedStatus}
    onJumpToMap={() => setActiveTab("map")}
    radius={radius}
  />
</main>

      {selectedStatus && (
        <StatusDetails 
          status={selectedStatus} 
          onClose={() => setSelectedStatus(null)} 
          onOpenChat={setActiveChat} 
        />
      )}
      
      {activeChat && (
        <ChatWindow 
          chat={activeChat} 
          onClose={() => setActiveChat(null)} 
        />
      )}
    </div>
  );
}

export default App;