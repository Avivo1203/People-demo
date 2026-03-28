import React, { useMemo } from "react";
import TimeAgo from "./TimeAgo";

/**
 * props:
 * - statuses: array of status objects
 * - userLocation: { latitude, longitude } | null
 * - onOpenChat(nickname)
 * - onJumpToMap({lat, lng})
 * - onOpenProfile(status)
 */

function getDistanceMeters(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) {
    return null;
  }

  const R = 6371e3;
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) *
      Math.cos(phi2) *
      Math.sin(deltaLambda / 2) *
      Math.sin(deltaLambda / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

function formatDistance(distance) {
  if (distance == null) return "ללא מרחק";
  if (distance < 1000) return `${distance} מטר ממך`;
  return `${(distance / 1000).toFixed(1)} ק״מ ממך`;
}

export default function StatusFeed({
  statuses = [],
  userLocation,
  onOpenChat,
  onJumpToMap,
  onOpenProfile,
}) {
  const recentStatuses = useMemo(() => {
    return [...statuses]
      .filter((status) => !!status?.timestamp && !!status?.text)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [statuses]);

  if (recentStatuses.length === 0) {
    return (
      <div className="status-feed-empty">
        <div className="status-feed-empty-icon">📭</div>
        <h3>אין עדיין סטטוסים באזור</h3>
        <p>פרסם סטטוס ראשון ותן למסך הזה להרגיש חי.</p>
      </div>
    );
  }

  return (
    <div className="status-feed-grid">
      {recentStatuses.map((status) => {
        const nickname = status.nickname?.trim() || "אנונימי";

        const distance =
          userLocation && status.location
            ? getDistanceMeters(
                userLocation.latitude,
                userLocation.longitude,
                status.location.lat,
                status.location.lng
              )
            : null;

        return (
          <article className="status-post-card" key={status.id}>
            <header className="status-post-head">
              <div className="status-post-avatar">{nickname[0]}</div>

              <div className="status-post-user">
                <div className="status-post-topline">
                  <strong className="status-post-name">{nickname}</strong>
                  <span className="status-post-dot">•</span>
                  <span className="status-post-time">
                    <TimeAgo timestamp={status.timestamp} />
                  </span>
                </div>

                <div className="status-post-meta">
                  <span className="status-post-badge">
                    📍 {formatDistance(distance)}
                  </span>
                </div>
              </div>
            </header>

            <div className="status-post-body">
              <p className="status-post-text">{status.text}</p>
            </div>

            <footer className="status-post-actions">
              <button
                type="button"
                className="status-action-btn primary"
                onClick={() => onOpenChat?.(nickname)}
              >
                💬 פתח צ׳אט
              </button>

              <button
                type="button"
                className="status-action-btn secondary"
                onClick={() => onOpenProfile?.(status)}
                title="הצג פרופיל"
              >
                👤 הצג פרופיל
              </button>

              <button
                type="button"
                className="status-action-btn secondary"
                onClick={() => status.location && onJumpToMap?.(status.location)}
                disabled={!status.location}
                title={status.location ? "קפיצה למיקום במפה" : "אין מיקום זמין"}
              >
                🗺️ הצג במפה
              </button>
            </footer>
          </article>
        );
      })}
    </div>
  );
}