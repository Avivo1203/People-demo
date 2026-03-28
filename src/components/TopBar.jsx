import React from "react";
import NavTabs from "./NavTabs";
import SearchBar from "./SearchBar";

export default function TopBar({
  activeTab,
  setActiveTab,
  searchTerm,
  onSearchChange,
  onOpenChat,
  onGoHome,
  onClear,
  onGetLocation,
  onPlaceSelect,
  onHideTopBar,
   // מועבר ל-NavTabs כדי ש✖ יסתיר את כל הטופ-בר
}) {
  return (
    <div className="topbar-wrap">
      <div className="topbar glass">
        <div className="topbar-row">
          <div className="topbar-tabs">
            <NavTabs
              activeTab={activeTab}
              onChangeTab={setActiveTab}
              onHideTopBar={onHideTopBar} // ← חשוב
            />
          </div>

          <div className="topbar-actions">
            <button className="icon-btn" onClick={onGoHome} title="דף הבית">🏠</button>
            <button
              className="icon-btn"
              title="מיקום נוכחי"
              onClick={() => {
                if (!navigator.geolocation) return alert("⚠️ אין תמיכה במיקום");
                navigator.geolocation.getCurrentPosition(
                  (pos) => onGetLocation?.({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
                  () => alert("⚠️ לא הצלחנו לקבל מיקום")
                );
              }}
            >
              📍
            </button>
            <button className="icon-btn" title="נקה סטטוסים" onClick={onClear}>🧹</button>
          </div>
        </div>

        <div className="topbar-search">
          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={onSearchChange}
            onOpenChat={onOpenChat}
            onPlaceSelect={onPlaceSelect}
          />
        </div>
      </div>
    </div>
  );
}
