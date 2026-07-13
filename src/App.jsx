import React, { useEffect, useMemo, useState, useCallback } from "react";
import RealMap from "./components/RealMap";
import StatusArea from "./components/StatusArea";
import StatusDetails from "./components/StatusDetails";
import WelcomePage from "./WelcomePage";
import TopBar from "./components/TopBar";
import ProfileCard from "./components/ProfileCard";
import "./index.css";

const STATUS_LIFETIME_MS = 24 * 60 * 60 * 1000;
const DEFAULT_RADIUS = 1500;
const API_BASE_URL = "http://localhost:5000";

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

function mapAreaStatusFromApi(status) {
  return {
    id: status.id,
    userId: status.userId,

    nickname:
      status.username ||
      `${status.firstName || ""} ${status.lastName || ""}`.trim() ||
      "משתמש",

    text: status.text,
    timestamp: status.createdAt,
    createdAt: status.createdAt,
    expiresAt: status.expiresAt,

    location: {
      lat: status.lat,
      lng: status.lng,
    },
  };
}

function mapCommentFromApi(comment) {
  return {
    id: comment.id,
    statusId: comment.statusId,

    nickname:
      comment.username ||
      `${comment.firstName || ""} ${comment.lastName || ""}`.trim() ||
      "משתמש",

    text: comment.text,
    timestamp: comment.createdAt,
    createdAt: comment.createdAt,
  };
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
  const [isRefreshingArea, setIsRefreshingArea] = useState(false);


  const fetchCommentsForStatuses = useCallback(async (statusList) => {
    try {
      const token = localStorage.getItem("token");

      if (!token || !Array.isArray(statusList)) {
        return;
      }

      if (statusList.length === 0) {
        setComments([]);
        return;
      }

      const commentRequests = statusList.map(async (status) => {
        try {
          const response = await fetch(
            `${API_BASE_URL}/api/comments/status/${status.id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const data = await response.json();

          if (!response.ok) {
            console.error(
              `Fetch comments failed for status ${status.id}:`,
              data
            );

            return [];
          }

          return data.map(mapCommentFromApi);
        } catch (error) {
          console.error(
            `Fetch comments error for status ${status.id}:`,
            error
          );

          return [];
        }
      });

      const commentsGroups = await Promise.all(commentRequests);
      const allComments = commentsGroups.flat();

      setComments(allComments);
    } catch (error) {
      console.error("Fetch comments for statuses error:", error);
    }
  }, []);

  const fetchNearbyStatuses = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) return;

      const response = await fetch(
        `${API_BASE_URL}/api/status/nearby?radius=${radius}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error("Fetch nearby statuses failed:", data);
        return;
      }

      const mappedStatuses = data.map(mapAreaStatusFromApi);

      setStatuses(mappedStatuses);

      await fetchCommentsForStatuses(mappedStatuses);
    } catch (error) {
      console.error("Fetch nearby statuses error:", error);
    }
  }, [radius, fetchCommentsForStatuses]);

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

  useEffect(() => {
    if (entered && userLocation && activeTab === "status") {
      fetchNearbyStatuses();
    }
  }, [entered, userLocation, activeTab, radius, fetchNearbyStatuses]);

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

  const addStatus = async (newStatus) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("צריך להתחבר כדי לפרסם סטטוס");
        return;
      }

      if (!userLocation) {
        alert("צריך להפעיל מיקום לפני פרסום סטטוס");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/status`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          text: newStatus.text,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "שגיאה בפרסום סטטוס");
        return;
      }

      await fetchNearbyStatuses();

      setCurrentUser((prev) => ({
        ...prev,
        statusCount: (prev.statusCount || 0) + 1,
      }));
    } catch (error) {
      console.error("Add status error:", error);
      alert("שגיאה בחיבור לשרת בזמן פרסום סטטוס");
    }
  };

  const addComment = async (statusId, text) => {
    const cleanText = text.trim();

    if (!cleanText) return;

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("צריך להתחבר כדי להגיב");
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/api/comments/${statusId}`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            text: cleanText,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "שגיאה בשליחת התגובה");
        return;
      }

      await fetchCommentsForStatuses(statuses);
    } catch (error) {
      console.error("Add comment error:", error);
      alert("שגיאה בחיבור לשרת בזמן שליחת התגובה");
    }
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

  const updateUserLocation = async (coords) => {
    if (!coords) {
      setUserLocation(null);
      setSelectedPlace(null);
      setNearbySearchTrigger(0);
      return;
    }

    setUserLocation(coords);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_BASE_URL}/api/location/activate`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          lat: coords.latitude,
          lng: coords.longitude,
          radius,
          privacyMode: "visible",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Location activate failed:", data);
        return;
      }

      console.log("📍 Location activated:", data);
    } catch (error) {
      console.error("Location activate error:", error);
    }
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

    fetchNearbyStatuses();
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
  const refreshAreaData = async () => {
  if (!userLocation) {
    alert("צריך להפעיל מיקום לפני רענון האזור");
    return;
  }

  if (isRefreshingArea) return;

  setIsRefreshingArea(true);

  try {
    await fetchNearbyStatuses();

    setNearbySearchTrigger((prev) => prev + 1);
  } catch (error) {
    console.error("Refresh area data error:", error);
    alert("לא הצלחנו לרענן את נתוני האזור");
  } finally {
    setIsRefreshingArea(false);
  }
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
      onRefreshArea={refreshAreaData}
      isRefreshingArea={isRefreshingArea}
      onOpenStatusArea={() => {
        setActiveTab("status");
        setShowTopBar(true);
      }}
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
            (comment) =>
              String(comment.statusId) === String(selectedStatus.id)
          )}
          onAddComment={addComment}
          onClose={() => setSelectedStatus(null)}
        />
      )}
    </div>
  );
}