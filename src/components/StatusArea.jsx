import React, { useMemo, useState } from "react";
import StatusForm from "./StatusForm";
import StatusFeed from "./StatusFeed";
import StoryGrid from "./StoryGrid";

/**
 * props:
 * - statuses: Array
 * - userLocation: { latitude, longitude } | null
 * - onAddStatus: (newStatus) => void
 * - onOpenChat: (nickname) => void
 * - onJumpToMap: ({lat, lng}) => void
 * - onShowTopBar: () => void
 * - isTopBarVisible: boolean
 * - radius?: number
 * - onOpenProfile?: (status) => void
 */
export default function StatusArea({
  statuses = [],
  userLocation,
  onAddStatus,
  onOpenChat,
  onJumpToMap,
  onShowTopBar,
  isTopBarVisible,
  radius = 1500,
  onOpenProfile,
}) {
  const [activeTab, setActiveTab] = useState("feed");

  const totalStatuses = statuses.length;

  const recentCount = useMemo(() => {
    const now = Date.now();

    return statuses.filter((status) => {
      if (!status?.timestamp) return false;
      const diff = now - new Date(status.timestamp).getTime();
      return diff <= 60 * 60 * 1000;
    }).length;
  }, [statuses]);

  const locatedCount = useMemo(() => {
    return statuses.filter((status) => !!status?.location).length;
  }, [statuses]);

  const radiusLabel = useMemo(() => {
    if (radius < 1000) return `${radius} מ׳`;
    const km = radius / 1000;
    return `${Number.isInteger(km) ? km : km.toFixed(1)} ק״מ`;
  }, [radius]);

  return (
    <section className="status-fullscreen">
      <div className="status-area-shell">
        <div className="status-area-hero">
          <div className="status-area-hero-text">
            <span className="status-area-eyebrow">Status Area</span>
            <h2>מה קורה סביבך עכשיו?</h2>
            <p>
              כאן המשתמשים מפרסמים עדכונים מהאזור שלהם, יוצרים קשר,
              משתפים רגעים ומתחברים לפי מיקום.
            </p>
          </div>

          <div className="status-area-stats">
            <div className="status-stat-box">
              <strong>{totalStatuses}</strong>
              <span>סטטוסים בסך הכל</span>
            </div>

            <div className="status-stat-box">
              <strong>{recentCount}</strong>
              <span>מהשעה האחרונה</span>
            </div>

            <div className="status-stat-box">
              <strong>{locatedCount}</strong>
              <span>עם מיקום משויך</span>
            </div>

            <div className="status-stat-box">
              <strong>{radiusLabel}</strong>
              <span>רדיוס פעיל</span>
            </div>
          </div>
        </div>

        {!isTopBarVisible && (
          <div className="status-topbar-return">
            <button
              type="button"
              className="status-return-btn"
              onClick={onShowTopBar}
            >
              ⬆️ הצג שוב את הסרגל העליון
            </button>
          </div>
        )}

        <div className="status-tabs">
          <button
            type="button"
            className={activeTab === "feed" ? "active" : ""}
            onClick={() => setActiveTab("feed")}
          >
            📰 פיד
          </button>

          <button
            type="button"
            className={activeTab === "story" ? "active" : ""}
            onClick={() => setActiveTab("story")}
          >
            📸 סטורי
          </button>

          <button
            type="button"
            className={activeTab === "good" ? "active" : ""}
            onClick={() => setActiveTab("good")}
          >
            💙 מעשים טובים
          </button>
        </div>

        <div className="status-composer-card">
          <div className="status-composer-head">
            <h3>פרסם סטטוס חדש</h3>
            <p>
              שתף משהו מהאזור שלך, בקש עזרה, תציע רעיון או פשוט תעדכן מה קורה.
            </p>
          </div>

          <StatusForm onAddStatus={onAddStatus} userLocation={userLocation} />
        </div>

        <div className="status-tab-content">
          {activeTab === "feed" && (
            <StatusFeed
              statuses={statuses}
              userLocation={userLocation}
              onOpenChat={onOpenChat}
              onJumpToMap={onJumpToMap}
              onOpenProfile={onOpenProfile}
            />
          )}

          {activeTab === "story" && (
            <StoryGrid
              statuses={statuses}
              userLocation={userLocation}
              onOpenChat={onOpenChat}
              onJumpToMap={onJumpToMap}
            />
          )}

          {activeTab === "good" && (
            <div className="status-good-placeholder">
              <div className="status-good-icon">🤝</div>
              <h3>מעשים טובים – בקרוב</h3>
              <p>
                כאן יוצגו בהמשך אינטראקציות חיוביות, עזרה מהקהילה ודירוגים טובים.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}