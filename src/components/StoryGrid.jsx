import React from "react";
import TimeAgo from "./TimeAgo";

/**
 * props:
 * - statuses: array of statuses (כולל media)
 * - userLocation: { latitude, longitude }
 * - onOpenChat(nickname)
 * - onJumpToMap({lat, lng})
 */
export default function StoryGrid({ statuses = [], userLocation, onOpenChat, onJumpToMap }) {
  const THIRTY_MIN_MS = 30 * 60 * 1000;

  const storyItems = statuses
    .filter((s) => s.media && new Date() - new Date(s.timestamp) < THIRTY_MIN_MS)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  if (storyItems.length === 0) {
    return (
      <div className="center" style={{ padding: "2rem", color: "#64748b" }}>
        אין סטוריז מהחצי שעה האחרונה 😕
      </div>
    );
  }

  return (
    <div className="story-grid">
      {storyItems.map((s) => {
        const nickname = s.nickname || "אנונימי";
        const isVideo = s.media?.type === "video";

        return (
          <div className="story-card" key={s.id}>
            <div className="story-media">
              {isVideo ? (
                <video src={s.media.url} controls preload="metadata" />
              ) : (
                <img src={s.media.url} alt="story" />
              )}
            </div>

            <div className="story-meta">
              <strong>{nickname}</strong> · <TimeAgo timestamp={s.timestamp} />
            </div>

            <div className="story-actions">
              <button onClick={() => onOpenChat?.(nickname)}>💬 צ׳אט</button>
              {s.location && (
                <button onClick={() => onJumpToMap?.(s.location)}>📍 מפה</button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
