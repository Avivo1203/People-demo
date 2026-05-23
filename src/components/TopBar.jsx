import React, { useState } from "react";
import { User, House, MapPinned, LoaderCircle, Trash2, LogOut } from "lucide-react";
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
}) {
  const [isLocating, setIsLocating] = useState(false);

  const [user, setUser] = useState(null);

  // בדיקה וטעינה של המשתמש מהדפדפן בזמן טעינת ה-TopBar
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

  // פונקציית עזר לקביעת השם המוצג לפי הדרישות של אביב
  const getUserDisplayName = () => {
    if (!user) return "";
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.username || user.nickname || "משתמש מחובר";
  };
 const handleLogout = () => {
    // 1. מחיקת כל הנתונים מהדפדפן
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("entered");
    localStorage.removeItem("guest");
    
    // 2. איפוס הסטייט המקומי
    setUser(null);
    
    // 3. חזרה בטוחה לעמוד הבית
    if (onGoHome) {
      onGoHome(); // מריץ את הלוגיקה שאביב העביר לכם לפתיחת עמוד הבית
    } else {
      window.location.replace(window.location.origin); // גיבוי בטוח שמונע שגיאות אבטחה של כרום
    }
  };
  const handleLocation = () => {
    if (!navigator.geolocation) {
      alert("הדפדפן שלך לא תומך במיקום גיאוגרפי.");
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onGetLocation?.({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
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

  const isStatusTab = activeTab === "status";

  return (
    <div className={`topbar-shell ${isStatusTab ? "topbar-shell-status" : "topbar-shell-map"}`}>
      <div className="topbar-stack">
        <NavTabs
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          radius={radius}
          onRadiusChange={setRadius}
          onHideTopBar={onHideTopBar}
        />

        <div className="topbar-row">
          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={onSearchChange}
            onOpenChat={onOpenChat}
            onPlaceSelect={onPlaceSelect}
          />

          <div className="topbar-actions">
            {/* 1. כפתור פרופיל - נשאר כמו שהוא */}
            <button
              type="button"
              onClick={onOpenProfile}
              title="פרופיל"
              className="topbar-action-btn profile"
            >
              <User size={19} strokeWidth={2.3} />
            </button>

            {/* 2. כפתור דף הבית הופך לדינמי - התחלף בהתנאה של אביב */}
            {user ? (
              /* מצב מחובר: מציג נקודה ירוקה, שם משתמש וכפתור התנתקות */
              <div style={{ display: "flex", alignItems: "center", gap: "12px", direction: "rtl" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "14px", color: "#4a5568" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#48bb78" }}></span>
                  <span>מחובר כ־{getUserDisplayName()}</span>
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
              /* מצב אורח: מציג את כפתור דף הבית המקורי */
              <button
                type="button"
                onClick={onGoHome}
                title="דף הבית"
                className="topbar-action-btn"
              >
                <House size={19} strokeWidth={2.3} />
              </button>
            )}

            {/* 3. כפתור מיקום - נשאר כמו שהוא */}
            <button
              type="button"
              onClick={handleLocation}
              disabled={isLocating}
              title={isLocating ? "מאתר מיקום..." : "מיקום נוכחי"}
              className={`topbar-action-btn ${isLocating ? "disabled" : ""}`}
            >
              {isLocating ? (
                <LoaderCircle size={19} strokeWidth={2.3} className="spin" />
              ) : (
                <MapPinned size={19} strokeWidth={2.3} />
              )}
            </button>

            {/* 4. כפתור נקה הכל - נשאר כמו שהוא */}
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