import React, { useMemo } from "react";
import {
  Map,
  MessageSquareText,
  Radius,
  X,
  Search, // ייבוא אייקון חיפוש יפה לכפתור החדש
} from "lucide-react";

export default function NavTabs({
  activeTab,
  onChangeTab,
  onHideTopBar,
  radius = 1500,
  onRadiusChange,
  userLocation,      // <-- פרופ חדש: מכיל את המיקום של המשתמש (אם קיים)
  onSearchNearby,    // <-- פרופ חדש: הפונקציה שתפעיל את החיפוש
}) {
  const isMap = activeTab === "map";

  // בדיקה האם המשתמש כבר הפעיל מיקום
  const hasLocation = !!userLocation;

  const radiusLabel = useMemo(() => {
    if (radius < 1000) return `${radius} מ׳`;
    const km = radius / 1000;
    return `${Number.isInteger(km) ? km : km.toFixed(1)} ק״מ`;
  }, [radius]);

  // פונקציה שמטפלת בלחיצה על הכפתור החדש
  const handleSearchClick = () => {
    if (!hasLocation) return;
    
    // מכינים את ה-Flow והצינורות קדימה כפי שאביב ביקש
    console.log("🚀 Radius Search Triggered:", {
      radius: radius,
      location: userLocation
    });

    // הפעלת הפונקציה שהתקבלה מאבא (App.jsx או TopBar)
    onSearchNearby?.(radius, userLocation);
  };

  return (
    <div className="navtabs-shell">
      <div className="navtabs-wrapper">
        <div className="navtabs-card">
          <div className="navtabs-glow navtabs-glow-blue" />
          <div className="navtabs-glow navtabs-glow-purple" />

          <div
            className="navtabs-inner"
            role="tablist"
            aria-label="Main sections"
          >
            <span
              className={`navtabs-indicator ${isMap ? "map-active" : "status-active"}`}
              aria-hidden="true"
            />

            <button
              type="button"
              role="tab"
              aria-selected={isMap}
              onClick={() => onChangeTab("map")}
              className={`navtab-btn ${isMap ? "active" : ""}`}
            >
              <div className="navtab-text">
                <span className="navtab-title">Map</span>
                <span className="navtab-subtitle">
                  מפה חיה, מיקומים ואנשים סביבך
                </span>
              </div>

              <div className={`navtab-icon ${isMap ? "active" : ""} map-mode`}>
                <Map size={22} strokeWidth={2.2} />
              </div>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={!isMap}
              onClick={() => onChangeTab("status")}
              className={`navtab-btn ${!isMap ? "active" : ""}`}
            >
              <div className="navtab-text">
                <span className="navtab-title">Status Area</span>
                <span className="navtab-subtitle">
                  פיד אזורי, סטטוסים, סטורי וצ׳אט
                </span>
              </div>

              <div className={`navtab-icon ${!isMap ? "active" : ""} status-mode`}>
                <MessageSquareText size={22} strokeWidth={2.2} />
              </div>
            </button>
          </div>
        </div>

        {/* הוספנו קלאס דינמי של radius-disabled במידה ואין מיקום */}
        <div className={`radius-card ${!hasLocation ? "radius-disabled" : ""}`}>
          <div className="navtabs-glow navtabs-glow-blue" />
          <div className="navtabs-glow navtabs-glow-purple radius-glow-alt" />

          <div className="radius-top">
            <div className="radius-title-wrap">
              <div className="radius-icon">
                <Radius size={18} strokeWidth={2.2} />
              </div>

              <div>
                <div className="radius-title">רדיוס חיפוש חכם</div>
                <div className="radius-subtitle">
                  בחר כמה רחוק להציג אנשים, סטטוסים ותוכן
                </div>
              </div>
            </div>

            <div className="radius-value">{radiusLabel}</div>
          </div>

          <div className="radius-slider-wrap">
            <div className="radius-slider-glow" />
            <input
              type="range"
              min="200"
              max="5000"
              step="100"
              value={radius}
              disabled={!hasLocation} // <-- חוסם את הסליידר אם אין מיקום
              onChange={(e) => onRadiusChange?.(Number(e.target.value))}
              aria-label="בחירת רדיוס"
              className="radius-slider"
            />
          </div>

          <div className="radius-marks">
            <span>200 מ׳</span>
            <span>1 ק״מ</span>
            <span>2.5 ק״מ</span>
            <span>5 ק״מ</span>
          </div>

          {/* === הכפתור החדש: Radius Action === */}
          <div className="radius-action-wrap">
            <button
              type="button"
              disabled={!hasLocation} // <-- חוסם את הכפתור אם אין מיקום
              onClick={handleSearchClick}
              className="radius-search-btn"
            >
              <Search size={16} strokeWidth={2.4} />
              <span>הצג באזור</span>
            </button>
          </div>
        </div>

        {activeTab === "status" && onHideTopBar && (
          <button
            type="button"
            onClick={onHideTopBar}
            title="הסתר סרגל"
            aria-label="הסתר סרגל עליון"
            className="navtabs-hide-btn"
          >
            <X size={17} strokeWidth={2.6} />
          </button>
        )}
      </div>
    </div>
  );
}