import React, { useEffect, useState } from "react";
import RealMap from "./components/RealMap";
import StatusArea from "./components/StatusArea";
import StatusDetails from "./components/StatusDetails";
import WelcomePage from "./WelcomePage";
import TopBar from "./components/TopBar";
import ProfileCard from "./components/ProfileCard";
import "./index.css";

export default function App() {
  const [statuses, setStatuses] = useState(() => {
    const saved = localStorage.getItem("statuses");
    return saved ? JSON.parse(saved) : [];
  });

  const [comments, setComments] = useState(() => {
    const saved = localStorage.getItem("comments");
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 1,
            statusId: 1001,
            nickname: "טל",
            text: "אני זורם, איפה בדיוק?",
            timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
          },
          {
            id: 2,
            statusId: 1002,
            nickname: "דניס",
            text: "יש לי מצית, אני קרוב.",
            timestamp: new Date(Date.now() - 1000 * 60 * 11).toISOString(),
          },
        ];
  });

  const [userLocation, setUserLocation] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [nearbySearchTrigger, setNearbySearchTrigger] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [entered, setEntered] = useState(
    () => localStorage.getItem("entered") === "true"
  );
  const [selectedStatus, setSelectedStatus] = useState(null);

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
          bio: "בונה את People – אפליקציה לחיבור בין אנשים לפי מיקום, פיד וסטטוסים.",
          city: "נתניה",
          mood: "פתוח להכיר ולעזור",
          vibe: "חברתי / יוזם",
          goodDeeds: 7,
          statusCount: 12,
          avatarUrl: "",
        };
  });

  useEffect(() => {
    localStorage.setItem("statuses", JSON.stringify(statuses));
  }, [statuses]);

  useEffect(() => {
    localStorage.setItem("comments", JSON.stringify(comments));
  }, [comments]);

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
          text: "יש למישהו גחלים או מצית? אנחנו בפארק",
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
  }, [statuses.length]);

  const filteredStatuses = statuses
    .filter((status) => {
      const age = Date.now() - new Date(status.timestamp).getTime();

      return (
        age < 24 * 60 * 60 * 1000 &&
        ((status.nickname || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
          (status.text || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()))
      );
    })
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const addStatus = (newStatus) => {
    setStatuses((prev) => [newStatus, ...prev]);
  };

  const addComment = (statusId, text) => {
    if (!text.trim()) return;

    const newComment = {
      id: Date.now(),
      statusId,
      nickname: currentUser?.nickname || currentUser?.fullName || "אני",
      text: text.trim(),
      timestamp: new Date().toISOString(),
    };

    setComments((prev) => [newComment, ...prev]);
  };

  const openStatusDetails = (status) => {
    setSelectedStatus(status);
  };

  const closeStatusDetails = () => {
    setSelectedStatus(null);
  };
const clearStatuses = () => {
  setStatuses([]);
  setComments([]);
  setUserLocation(null);
  setSelectedPlace(null);
  setRadius(1500);
  setNearbySearchTrigger(0);
  setSearchTerm("");
  setActiveTab("map");
  setShowTopBar(true);

  localStorage.removeItem("statuses");
  localStorage.removeItem("comments");
};
 const updateUserLocation = (coords) => {
  setUserLocation(coords);

  const testStatusNearMe = {
    id: Date.now(),
    nickname: "בדיקה",
    text: "אני סטטוס בדיקה ליד המיקום שלך",
    timestamp: new Date().toISOString(),
    location: {
      lat: coords.latitude + 0.001,
      lng: coords.longitude + 0.001,
    },
  };

  setStatuses((prev) => [testStatusNearMe, ...prev]);
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
  onGoHome={goHome}
  onClear={clearStatuses}
  onGetLocation={updateUserLocation}
  onPlaceSelect={handlePlaceSelect}
  onHideTopBar={() => setShowTopBar(false)}
  onOpenProfile={() => setIsProfileOpen(true)}
  userLocation={userLocation}
  onSearchNearby={() => {
    if (!userLocation) {
      alert("קודם צריך להפעיל מיקום");
      return;
    }

    setActiveTab("map");
    setShowTopBar(true);
    setNearbySearchTrigger((prev) => prev + 1);
  }}
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
          comments={comments}
          statuses={filteredStatuses}
          userLocation={userLocation}
          selectedPlace={selectedPlace}
          onOpenStatus={openStatusDetails}
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
          onOpenStatus={openStatusDetails}
          onJumpToMap={jumpToMapFromStatus}
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

      {selectedStatus && (
        <StatusDetails
          status={selectedStatus}
          comments={comments.filter(
            (comment) => comment.statusId === selectedStatus.id
          )}
          onAddComment={addComment}
          onClose={closeStatusDetails}
        />
      )}
    </div>
  );
}