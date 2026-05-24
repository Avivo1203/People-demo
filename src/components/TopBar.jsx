import React, { useState } from "react";
import {
  User,
  House,
  MapPinned,
  LoaderCircle,
  Trash2,
  LogOut,
} from "lucide-react";

import NavTabs from "./NavTabs";
import SearchBar from "./SearchBar";

export default function TopBar({
  activeTab,
  setActiveTab,
  radius,
  setRadius,
  searchTerm,
  onSearchChange,
  onOpenChat,
  onGoHome,
  onClear,
  onGetLocation,
  onPlaceSelect,
  onHideTopBar,
  onOpenProfile,
  onSearchNearby, // <-- פרופ חדש: כדי שנוכל להעביר אותו הלאה לאבא הגדול (App.jsx)
}) {
  const [isLocating, setIsLocating] = useState(false);

  // מצב שמראה אם המשתמש כבר הפעיל מיקום
  const [locationEnabled, setLocationEnabled] = useState(false);
  
  // <-- סטייט חדש: שומר את הקואורדינטות האמיתיות בשביל ה-Flow של הרדיוס
  const [userLocation, setUserLocation] = useState(null); 

  const [user, setUser] = useState(null);

  // טעינת המשתמש מה-localStorage
  React.useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Error parsing user from localStorage:", error);
      }
    }
  }, []);

  // שם משתמש דינמי
  const getUserDisplayName = () => {
    if (!user) return "";

    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }

    return user.username || user.nickname || "משתמש מחובר";
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("entered");
    localStorage.removeItem("guest");

    setUser(null);

    if (onGoHome) {
      onGoHome();
    } else {
      window.location.replace(window.location.origin);
    }
  };

  // הפעלת מיקום
  const handleLocation = () => {
    if (!navigator.geolocation) {
      alert("הדפדפן שלך לא תומך במיקום גיאוגרפי.");
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        };

        // שולח למעלה לאבא אם צריך
        onGetLocation?.(coords);

        // <-- שומר מקומית את המיקום כדי להעביר ל-NavTabs
        setUserLocation(coords);

        // מצב שהמיקום הופעל בהצלחה
        setLocationEnabled(true);

        setIsLocating(false);
      },

      () => {
        alert("לא הצלחנו לקבל את המיקום. אנא אפשר/י גישה.");
        setIsLocating(false);
      },

      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // פונקציית תיווך שמקבלת את הלחיצה מ-NavTabs ומעבירה למעלה
  const handleSearchNearby = (currentRadius, currentLoc) => {
    onSearchNearby?.(currentRadius, currentLoc);
  };

  const isStatusTab = activeTab === "status";

  return (
    <div
      className={`topbar-shell ${
        isStatusTab
          ? "topbar-shell-status"
          : "topbar-shell-map"
      }`}
    >
      <div className="topbar-stack">

        {/* עדכנו את ה-Props של NavTabs כאן למטה */}
        <NavTabs
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          radius={radius}
          onRadiusChange={setRadius}
          onHideTopBar={onHideTopBar}
          userLocation={userLocation}       
          onSearchNearby={handleSearchNearby}  
        />

        <div className="topbar-row">

          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={onSearchChange}
            onOpenChat={onOpenChat}
            onPlaceSelect={onPlaceSelect}
          />

          <div className="topbar-actions">

            {/* פרופיל */}
            <button
              type="button"
              onClick={onOpenProfile}
              title="פרופיל"
              className="topbar-action-btn profile"
            >
              <User size={19} strokeWidth={2.3} />
            </button>

            {/* משתמש מחובר / אורח */}
            {user ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  direction: "rtl",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "14px",
                    color: "#4a5568",
                  }}
                >
                  <span
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      backgroundColor: "#48bb78",
                    }}
                  ></span>

                  <span>
                    מחובר כ־{getUserDisplayName()}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  title="התנתקות"
                  className="topbar-action-btn"
                  style={{ color: "#e11d48" }}
                >
                  <LogOut size={19} strokeWidth={2.3} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onGoHome}
                title="דף הבית"
                className="topbar-action-btn"
              >
                <House size={19} strokeWidth={2.3} />
              </button>
            )}

            {/* הפעל מיקום */}
            <button
              type="button"
              onClick={handleLocation}
              disabled={isLocating}
              title={
                isLocating
                  ? "מפעיל מיקום..."
                  : locationEnabled
                  ? "מיקום פעיל"
                  : "הפעל מיקום"
              }
              className={`topbar-action-btn ${
                isLocating ? "disabled" : ""
              } ${
                locationEnabled ? "active-location" : ""
              }`}
            >
              {isLocating ? (
                <LoaderCircle
                  size={19}
                  strokeWidth={2.3}
                  className="spin"
                />
              ) : (
                <MapPinned
                  size={19}
                  strokeWidth={2.3}
                />
              )}
            </button>

            {/* נקה הכל */}
            <button
              type="button"
              onClick={onClear}
              title="נקה הכל"
              className="topbar-action-btn"
            >
              <Trash2 size={19} strokeWidth={2.3} />
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}