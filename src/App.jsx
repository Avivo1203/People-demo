import React, { useEffect, useState } from "react";
import RealMap from "./components/RealMap";
import ChatWindow from "./components/ChatWindow";
import StatusArea from "./components/StatusArea";
import WelcomePage from "./WelcomePage";
import TopBar from "./components/TopBar";
import ProfileCard from "./components/ProfileCard";
import "./index.css";

export default function App() {
  const [statuses, setStatuses] = useState(() => {
    const saved = localStorage.getItem("statuses");
    return saved ? JSON.parse(saved) : [];
  });

  const [chatUser, setChatUser] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [entered, setEntered] = useState(
    () => localStorage.getItem("entered") === "true"
  );

  const [activeTab, setActiveTab] = useState("map");
  const [showTopBar, setShowTopBar] = useState(true);
  const [radius, setRadius] = useState(1500);

  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem("currentUser");
    return saved
      ? JSON.parse(saved)
      : {
          fullName: "Aviv Oshri",
          nickname: "aviv",
          bio: "בונה את People – אפליקציה לחיבור בין אנשים לפי מיקום, פיד, סטטוסים וצ׳אט.",
          city: "נתניה",
          mood: "פתוח להכיר ולעזור",
          vibe: "חברתי / יוזם",
          goodDeeds: 7,
          statusCount: 12,
          storyCount: 4,
          avatarUrl: "",
        };
  });

  useEffect(() => {
    localStorage.setItem("statuses", JSON.stringify(statuses));
  }, [statuses]);

  useEffect(() => {
    localStorage.setItem("currentUser", JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    if (statuses.length === 0) {
      const starterStatuses = [
        {
          id: 1001,
          nickname: "דניס",
          text: "מישהו זורם לכדורגל באזור?",
          timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
          location: { lat: 32.0853, lng: 34.7818 },
        },
        {
          id: 1002,
          nickname: "טל",
          text: "יש למישהו גחלים או מצית? אנחנו בפארק 😅",
          timestamp: new Date(Date.now() - 1000 * 60 * 17).toISOString(),
          location: { lat: 32.082, lng: 34.779 },
        },
        {
          id: 1003,
          nickname: "אביב",
          text: "מי באזור ורוצה לקפוץ לקפה?",
          timestamp: new Date(Date.now() - 1000 * 60 * 33).toISOString(),
          location: { lat: 32.0795, lng: 34.7862 },
        },
      ];

      setStatuses(starterStatuses);
    }
  }, []);

  const filteredStatuses = statuses
    .filter((s) => {
      const age = Date.now() - new Date(s.timestamp).getTime();

      return (
        age < 24 * 60 * 60 * 1000 &&
        (
          ((s.nickname || "").toLowerCase().includes(searchTerm.toLowerCase())) ||
          ((s.text || "").toLowerCase().includes(searchTerm.toLowerCase()))
        )
      );
    })
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const addStatus = (newStatus) => {
    setStatuses((prev) => [newStatus, ...prev]);
  };

  const openChat = (nickname) => {
    setChatUser(nickname);
  };

  const closeChat = () => {
    setChatUser(null);
  };

  const clearStatuses = () => {
    setStatuses([]);
    localStorage.removeItem("statuses");
  };

  const updateUserLocation = (coords) => {
    setUserLocation(coords);
  };

  const enterApp = () => {
    localStorage.setItem("entered", "true");
    setEntered(true);
  };

  const goHome = () => {
    localStorage.clear();
    window.location.reload();
  };

  const jumpToMapFromStatus = (loc) => {
    if (!loc) return;

    setActiveTab("map");
    setUserLocation({
      latitude: loc.lat,
      longitude: loc.lng,
    });
    setShowTopBar(true);
  };

  const handlePlaceSelect = (place) => {
    const lat = parseFloat(place.lat);
    const lon = parseFloat(place.lon);

    setUserLocation({
      latitude: lat,
      longitude: lon,
    });

    setActiveTab("map");
    setShowTopBar(true);
  };

  const mapCenterKey = userLocation
    ? `${Number(userLocation.latitude).toFixed(5)},${Number(
        userLocation.longitude
      ).toFixed(5)}`
    : "default";

  if (!entered) {
    return <WelcomePage onEnter={enterApp} />;
  }

  return (
    <div
      className="app-container"
      dir="rtl"
      style={{
        height: "100vh",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {showTopBar && (
        <TopBar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          radius={radius}
          setRadius={setRadius}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onOpenChat={(nick) => setChatUser(nick)}
          onGoHome={goHome}
          onClear={clearStatuses}
          onGetLocation={updateUserLocation}
          onPlaceSelect={handlePlaceSelect}
          onHideTopBar={() => setShowTopBar(false)}
          onOpenProfile={() => setIsProfileOpen(true)}
        />
      )}

      {isProfileOpen && (
        <ProfileCard
          user={currentUser}
          onClose={() => setIsProfileOpen(false)}
          onEdit={() => {
            alert("שלב הבא: Profile Panel / Edit Profile");
          }}
        />
      )}

      {activeTab === "map" && (
        <RealMap
          key={mapCenterKey}
          statuses={filteredStatuses}
          userLocation={userLocation}
          onOpenChat={openChat}
          radius={radius}
        />
      )}

      {activeTab === "status" && (
        <StatusArea
          statuses={filteredStatuses}
          userLocation={userLocation}
          onAddStatus={addStatus}
          onOpenChat={openChat}
          onJumpToMap={jumpToMapFromStatus}
          onShowTopBar={() => setShowTopBar(true)}
          isTopBarVisible={showTopBar}
          radius={radius}
          onOpenProfile={(status) => {
            setCurrentUser((prev) => ({
              ...prev,
              fullName: status.nickname || prev.fullName,
              nickname: status.nickname || prev.nickname,
              bio: status.text || prev.bio,
            }));
            setIsProfileOpen(true);
          }}
        />
      )}

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