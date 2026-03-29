import React, { useMemo } from "react";
import {
  Map,
  MessageSquareText,
  Radius,
  X,
} from "lucide-react";

export default function NavTabs({
  activeTab,
  onChangeTab,
  onHideTopBar,
  radius = 1500,
  onRadiusChange,
}) {
  const isMap = activeTab === "map";

  const radiusLabel = useMemo(() => {
    if (radius < 1000) return `${radius} מ׳`;
    const km = radius / 1000;
    return `${Number.isInteger(km) ? km : km.toFixed(1)} ק״מ`;
  }, [radius]);

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

        <div className="radius-card">
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