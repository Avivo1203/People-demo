import React from "react";
import TimeAgo from "./TimeAgo"; // קובץ קטן שממיר timestamp ל"שעה/דקות לפני"

/**
 * props:
 * - statuses: array of status objects
 * - userLocation: { latitude, longitude }
 * - onOpenChat(nickname)
 * - onJumpToMap({lat, lng})
 */
export default function StatusFeed({ statuses = [], userLocation, onOpenChat, onJumpToMap }) {
  // חישוב מרחק בין שתי נקודות – נוסחת Haversine
  const getDistanceMeters = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371e3; // רדיוס כדוה"א במטרים
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c); // במטרים
  };

  const recentStatuses = statuses
    .filter(s => !!s.timestamp && !!s.text)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return (
    <div className="status-list-wrapper">
      {recentStatuses.length === 0 ? (
        <div className="center" style={{ padding: "1rem", color: "#64748b" }}>
          🤷‍♂️ אין עדיין סטטוסים
        </div>
      ) : (
        <div className="feed-list">
          {recentStatuses.map((status) => {
            const nickname = status.nickname || "אנונימי";
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
              <article className="status-card" key={status.id}>
                <header className="status-head">
                  <div className="avatar-mini">{nickname[0]}</div>
                  <div className="who-when">
                    <strong className="nick">{nickname}</strong>
                    <div className="meta-line">
                      <TimeAgo timestamp={status.timestamp} />
                      {distance !== null && (
                        <span style={{ marginInlineStart: 8, fontSize: 12 }}>
                          • {distance} מטר ממך
                        </span>
                      )}
                    </div>
                  </div>
                </header>

                <p className="status-text">{status.text}</p>

                <footer className="status-actions-row">
                  <button className="map-cta" onClick={() => onOpenChat?.(nickname)}>
                    💬 צ׳אט
                  </button>
                  {status.location && (
                    <button
                      className="map-cta"
                      onClick={() => onJumpToMap?.(status.location)}
                    >
                      📍 מפה
                    </button>
                  )}
                </footer>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
