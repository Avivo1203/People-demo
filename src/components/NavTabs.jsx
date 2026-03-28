import React from "react";
export default function NavTabs({ activeTab, onChangeTab, onHideTopBar }) {
  const isMap = activeTab === "map";
  const indicatorX = isMap ? "0%" : "100%";

  return (
    <div style={{ position: "relative" }}>
      <nav className="pill-tabs" role="tablist" aria-label="Main sections">
        <span
          className="pill-indicator"
          style={{ transform: `translateX(${indicatorX})` }}
          aria-hidden="true"
        />
        <button
          role="tab"
          aria-selected={isMap}
          className={`pill-btn ${isMap ? "active" : ""}`}
          onClick={() => onChangeTab("map")}
        >
        📝 StatusArea

        </button>
        <button
          role="tab"
          aria-selected={!isMap}
          className={`pill-btn ${!isMap ? "active" : ""}`}
          onClick={() => onChangeTab("status")}
        >
          🗺️ Map
        </button>
      </nav>

      {/* ✖ כפתור הסתרה – זמין רק בטאב Status; מסתיר את כל ה-TopBar */}
      {activeTab === "status" && onHideTopBar && (
        <button
          onClick={onHideTopBar}
          title="הסתר סרגל"
          style={{
            position: "absolute",
            top: "8px",
            right: "8px",
            background: "#e2e8f0",
            border: "none",
            borderRadius: "10px",
            padding: "6px 10px",
            fontWeight: 600,
            fontSize: "14px",
            cursor: "pointer",
            zIndex: 10,
          }}
          aria-label="הסתר סרגל עליון"
        >
          ✖
        </button>
      )}
    </div>
  );
}
