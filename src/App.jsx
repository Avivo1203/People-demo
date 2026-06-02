import React, { useEffect, useMemo, useState } from "react";
import RealMap from "./components/RealMap";
import StatusArea from "./components/StatusArea";
import StatusDetails from "./components/StatusDetails";
import WelcomePage from "./WelcomePage";
import TopBar from "./components/TopBar";
import ProfileCard from "./components/ProfileCard";
import "./index.css";

const STATUS_LIFETIME_MS = 24 * 60 * 60 * 1000;
const DEFAULT_RADIUS = 1500;

function loadFromStorage(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

function isStatusFresh(status) {
  if (!status?.timestamp) return false;

  const createdAt = new Date(status.timestamp).getTime();
  if (Number.isNaN(createdAt)) return false;

  return Date.now() - createdAt < STATUS_LIFETIME_MS;
}

export default function App() {
  const [statuses, setStatuses] = useState(() =>
    loadFromStorage("statuses", []).filter(isStatusFresh)
  );

  const [comments, setComments] = useState(() =>
    loadFromStorage("comments", [])
  );

  const [currentUser, setCurrentUser] = useState(() =>
    loadFromStorage("currentUser", {
      fullName: "משתמש אורח",
      nickname: "guest",
      bio: "משתמש זמני באפליקציית People.",
      city: "לא הוגדר",
      mood: "זמין",
      vibe: "חברתי",
      statusCount: 0,
      avatarUrl: "",
    })
  );

  const [entered, setEntered] = useState(
    () => localStorage.getItem("entered") === "true"
  );

  const [userLocation, setUserLocation] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [nearbySearchTrigger, setNearbySearchTrigger] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [activeTab, setActiveTab] = useState("map");
  const [showTopBar, setShowTopBar] = useState(true);
  const [radius, setRadius] = useState(DEFAULT_RADIUS);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    const freshStatuses = statuses.filter(isStatusFresh);

    if (freshStatuses.length !== statuses.length) {
      setStatuses(freshStatuses);
      return;
    }

    localStorage.setItem("statuses", JSON.stringify(freshStatuses));
  }, [statuses]);

  useEffect(() => {
    localStorage.setItem("comments", JSON.stringify(comments));
  }, [comments]);

  useEffect(() => {
    localStorage.setItem("currentUser", JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      setStatuses((prev) => prev.filter(isStatusFresh));
    }, 60 * 1000);

    return () => clearInterval(cleanupInterval);
  }, []);

  const filteredStatuses = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return statuses
      .filter((status) => {
        if (!isStatusFresh(status)) return false;

        if (!term) return true;

        return (
          (status.nickname || "").toLowerCase().includes(term) ||
          (status.text || "").toLowerCase().includes(term)
        );
      })
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [statuses, searchTerm]);

  const addStatus = (newStatus) => {
    setStatuses((prev) => [newStatus, ...prev]);

    setCurrentUser((prev) => ({
      ...prev,
      statusCount: (prev.statusCount || 0) + 1,
    }));
  };

  const addComment = (statusId, text) => {
    const cleanText = text.trim();
    if (!cleanText) return;

    const newComment = {
      id: Date.now(),
      statusId,
      nickname: currentUser?.nickname || "אני",
      text: cleanText,
      timestamp: new Date().toISOString(),
    };

    setComments((prev) => [newComment, ...prev]);
  };

  const clearStatuses = () => {
    setStatuses([]);
    setComments([]);
    setUserLocation(null);
    setSelectedPlace(null);
    setRadius(DEFAULT_RADIUS);
    setNearbySearchTrigger(0);
    setSearchTerm("");
    setActiveTab("map");
    setShowTopBar(true);
    setSelectedStatus(null);

    localStorage.removeItem("statuses");
    localStorage.removeItem("comments");
  };

  const updateUserLocation = (coords) => {
    if (!coords) {
      setUserLocation(null);
      setSelectedPlace(null);
      setNearbySearchTrigger(0);
      return;
    }

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

    setSelectedPlace({
      lat: loc.lat,
      lng: loc.lng,
      name: "מיקום של סטטוס",
    });

    setActiveTab("map");
    setShowTopBar(true);
  };

  const handlePlaceSelect = (place) => {
    const lat = parseFloat(place.lat);
    const lon = parseFloat(place.lon);

    if (Number.isNaN(lat) || Number.isNaN(lon)) return;

    setSelectedPlace({
      lat,
      lng: lon,
      name: place.display_name || place.name || "מיקום שנבחר",
    });

    setActiveTab("map");
    setShowTopBar(true);
  };

  const handleSearchNearby = () => {
    if (!userLocation) {
      alert("קודם צריך להפעיל מיקום");
      return;
    }

    const testStatusNearMe = {
      id: Date.now(),
      nickname: "בדיקה",
      text: "אני סטטוס בדיקה ליד המיקום שלך",
      timestamp: new Date().toISOString(),
      location: {
        lat: userLocation.latitude + 0.001,
        lng: userLocation.longitude + 0.001,
      },
    };

    setStatuses((prev) => [testStatusNearMe, ...prev]);
    setActiveTab("map");
    setShowTopBar(true);
    setNearbySearchTrigger((prev) => prev + 1);
  };

  const openProfileFromStatus = (status) => {
    setCurrentUser((prev) => ({
      ...prev,
      fullName: status.nickname || prev.fullName,
      nickname: status.nickname || prev.nickname,
      bio: status.text || prev.bio,
    }));

    setIsProfileOpen(true);
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
    <div className="app-container" dir="rtl">
      {showTopBar && (
        <TopBar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          radius={radius}
          setRadius={setRadius}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onGoHome={goHome}
          onClear={clearStatuses}
          onGetLocation={updateUserLocation}
          onPlaceSelect={handlePlaceSelect}
          onHideTopBar={() => setShowTopBar(false)}
          onOpenProfile={() => setIsProfileOpen(true)}
          userLocation={userLocation}
          onSearchNearby={handleSearchNearby}
        />
      )}

      {isProfileOpen && (
        <ProfileCard
          user={currentUser}
          onClose={() => setIsProfileOpen(false)}
          onEdit={() => {
            alert("עריכת פרופיל תתווסף בשלב הבא");
          }}
        />
      )}

      {activeTab === "map" && (
        <RealMap
          key={mapCenterKey}
          statuses={filteredStatuses}
          comments={comments}
          userLocation={userLocation}
          selectedPlace={selectedPlace}
          onOpenStatus={setSelectedStatus}
          radius={radius}
          nearbySearchTrigger={nearbySearchTrigger}
        />
      )}

      {activeTab === "status" && (
        <StatusArea
          statuses={filteredStatuses}
          comments={comments}
          userLocation={userLocation}
          onAddStatus={addStatus}
          onOpenStatus={setSelectedStatus}
          onJumpToMap={jumpToMapFromStatus}
          radius={radius}
          onOpenProfile={openProfileFromStatus}
        />
      )}

      {selectedStatus && (
        <StatusDetails
          status={selectedStatus}
          comments={comments.filter(
            (comment) => comment.statusId === selectedStatus.id
          )}
          onAddComment={addComment}
          onClose={() => setSelectedStatus(null)}
        />
      )}
    </div>
  );
}