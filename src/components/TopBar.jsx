import React, { useState } from "react";
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

  const wrapStyle = {
    position: "absolute",
    top: "16px",
    left: "50%",
    transform: "translateX(-50%)",
    width: "min(1180px, calc(100% - 24px))",
    zIndex: 500,
    direction: "rtl",
  };

  const cardStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  };

  const rowStyle = {
    display: "grid",
    gridTemplateColumns: "1fr auto",
    gap: "12px",
    alignItems: "center",
  };

  const actionsStyle = {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: "rgba(255,255,255,0.72)",
    backdropFilter: "blur(18px)",
    WebkitBackdropFilter: "blur(18px)",
    border: "1px solid rgba(255,255,255,0.55)",
    borderRadius: "22px",
    padding: "10px",
    boxShadow: "0 10px 28px rgba(15,23,42,0.10)",
  };

  const btnStyle = {
    width: "48px",
    height: "48px",
    border: "none",
    borderRadius: "16px",
    background:
      "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(241,245,249,0.88))",
    boxShadow: "0 8px 18px rgba(15,23,42,0.10)",
    fontSize: "20px",
    cursor: "pointer",
    transition: "0.2s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const disabledBtnStyle = {
    ...btnStyle,
    opacity: 0.65,
    cursor: "not-allowed",
  };

  const profileBtnStyle = {
    ...btnStyle,
    background:
      "linear-gradient(135deg, rgba(219,234,254,0.95), rgba(239,246,255,0.92))",
    color: "#1d4ed8",
    fontWeight: 900,
  };

  const handleLocation = () => {
    if (!navigator.geolocation) {
      alert("⚠️ הדפדפן שלך לא תומך במיקום גיאוגרפי.");
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
        alert("⚠️ לא הצלחנו לקבל את המיקום. אנא אפשר/י גישה.");
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  return (
    <div style={wrapStyle}>
      <div style={cardStyle}>
        <NavTabs
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          radius={radius}
          onRadiusChange={setRadius}
          onHideTopBar={onHideTopBar}
        />

        <div style={rowStyle}>
          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={onSearchChange}
            onOpenChat={onOpenChat}
            onPlaceSelect={onPlaceSelect}
          />

          <div style={actionsStyle}>
            <button
              type="button"
              onClick={onOpenProfile}
              title="פרופיל"
              style={profileBtnStyle}
            >
              👤
            </button>

            <button
              type="button"
              onClick={onGoHome}
              title="דף הבית"
              style={btnStyle}
            >
              🏠
            </button>

            <button
              type="button"
              onClick={handleLocation}
              disabled={isLocating}
              title={isLocating ? "מאתר מיקום..." : "מיקום נוכחי"}
              style={isLocating ? disabledBtnStyle : btnStyle}
            >
              {isLocating ? "⌛" : "📍"}
            </button>

            <button
              type="button"
              onClick={onClear}
              title="נקה הכל"
              style={btnStyle}
            >
              🧹
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}