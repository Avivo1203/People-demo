import React, { useEffect, useState } from "react";
import RealMap from "./components/RealMap";
import ChatWindow from "./components/ChatWindow";
import StatusArea from "./components/StatusArea";
import WelcomePage from "./WelcomePage";
import TopBar from "./components/TopBar";
import "./index.css";

export default function App() {
  const [statuses, setStatuses] = useState(() => {
    const saved = localStorage.getItem("statuses");
    return saved ? JSON.parse(saved) : [];
  });

  const [chatUser, setChatUser] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [entered, setEntered] = useState(() => localStorage.getItem("entered") === "true");

  const [activeTab, setActiveTab] = useState("map");     // "map" | "status"
  const [showTopBar, setShowTopBar] = useState(true);    // שליטה על הצגת ה-TopBar (NavTabs + SearchBar)

  useEffect(() => {
    localStorage.setItem("statuses", JSON.stringify(statuses));
  }, [statuses]);

  const filteredStatuses = statuses
    .filter((s) => {
      const age = Date.now() - new Date(s.timestamp).getTime();
      return (
        age < 24 * 60 * 60 * 1000 &&
        ((s.nickname || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (s.text || "").toLowerCase().includes(searchTerm.toLowerCase()))
      );
    })
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const addStatus = (newStatus) => setStatuses((prev) => [newStatus, ...prev]);
  const openChat = (nickname) => setChatUser(nickname);
  const closeChat = () => setChatUser(null);
  const clearStatuses = () => {
    setStatuses([]);
    localStorage.removeItem("statuses");
  };
  const updateUserLocation = (coords) => setUserLocation(coords);

  const enterApp = () => {
    localStorage.setItem("entered", "true");
    setEntered(true);
  };const goHome = () => {
  localStorage.clear();
  window.location.reload();
};


  // קפיצה למפה ממסך הסטטוסים (כשיש location בתוך סטטוס)
  const jumpToMapFromStatus = (loc) => {
    if (!loc) return;
    setActiveTab("map");
    setUserLocation({ latitude: loc.lat, longitude: loc.lng });
    setShowTopBar(true);
  };

  // כשהמשתמש בוחר מקום מהחיפוש – עוברים למפה וממרכזים
  const handlePlaceSelect = (place) => {
    const lat = parseFloat(place.lat);
    const lon = parseFloat(place.lon);
    setUserLocation({ latitude: lat, longitude: lon });
    setActiveTab("map");
  };

  const mapCenterKey = userLocation
    ? `${Number(userLocation.latitude).toFixed(5)},${Number(userLocation.longitude).toFixed(5)}`
    : "default";

  if (!entered) return <WelcomePage onEnter={enterApp} />;

  return (
    <div className="app-container" dir="rtl" style={{ height: "100vh", overflow: "hidden", position: "relative" }}>
      {/* 🔝 סרגל עליון (NavTabs + SearchBar) – מוצג רק כשshowTopBar=true */}
      {showTopBar && (
        <TopBar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onOpenChat={(nick) => setChatUser(nick)}
            onGoHome={() => {
  localStorage.clear();
  window.location.reload();
}}          onClear={() => setStatuses([])}
          onGetLocation={setUserLocation}
          onPlaceSelect={handlePlaceSelect}
          onHideTopBar={() => setShowTopBar(false)}  
           // ← לחיצה על ✖ תסתיר את ה-TopBar
        />
      )}

      {/* 🗺️ טאב פעיל */}
      {activeTab === "map" && (
        <RealMap
          key={mapCenterKey}
          statuses={filteredStatuses}
          onOpenChat={openChat}
          userLocation={userLocation}
        />
      )}

      {activeTab === "status" && (
        <StatusArea
          statuses={filteredStatuses}
          userLocation={userLocation}
          onAddStatus={addStatus}
          onOpenChat={openChat}
          onJumpToMap={jumpToMapFromStatus}
          // שליטה בהחזרת הסרגל כשצריך:
          onShowTopBar={() => setShowTopBar(true)}
          isTopBarVisible={showTopBar}
        />
      )}

      {/* 💬 צ'אט מוקפץ */}
      {chatUser && (
        <div
          style={{
            position: "fixed",
            bottom: "60px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 999,
            width: "100%",
            maxWidth: "460px",
            maxHeight: "75vh",
            background: "#fff",
            borderRadius: "16px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
            overflow: "hidden",
          }}
        >
          <ChatWindow selectedUser={chatUser} onClose={closeChat} />
        </div>
      )}
    </div>
  );
}
