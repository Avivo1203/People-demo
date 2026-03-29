import React, { useState } from "react";
import { User, House, MapPinned, LoaderCircle, Trash2 } from "lucide-react";
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
            <button
              type="button"
              onClick={onOpenProfile}
              title="פרופיל"
              className="topbar-action-btn profile"
            >
              <User size={19} strokeWidth={2.3} />
            </button>

            <button
              type="button"
              onClick={onGoHome}
              title="דף הבית"
              className="topbar-action-btn"
            >
              <House size={19} strokeWidth={2.3} />
            </button>

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