import React, { useMemo } from "react";
import TimeAgo from "./TimeAgo";

/**
 * props:
 * - statuses: array of statuses (כולל media)
 * - onOpenChat(nickname)
 * - onJumpToMap({lat, lng})
 */
export default function StoryGrid({
  statuses = [],
  onOpenChat,
  onJumpToMap,
}) {
  const THIRTY_MIN_MS = 30 * 60 * 1000;

  const storyItems = useMemo(() => {
    return [...statuses]
      .filter((status) => {
        const hasMedia = !!status?.media?.url;
        const isFresh =
          status?.timestamp &&
          new Date() - new Date(status.timestamp) < THIRTY_MIN_MS;

        return hasMedia && isFresh;
      })
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [statuses]);

  if (storyItems.length === 0) {
    return (
      <div className="story-empty-state">
        <div className="story-empty-icon">📸</div>
        <h3>אין סטוריז חדשים כרגע</h3>
        <p>כשתוסיף תמונה או וידאו לסטטוס, זה יופיע כאן אוטומטית.</p>
      </div>
    );
  }

  return (
    <div className="story-section">
      <div className="story-section-head">
        <div>
          <span className="story-section-eyebrow">Stories</span>
          <h3>רגעים מהאזור שלך</h3>
        </div>
        <span className="story-section-count">{storyItems.length} פעילים</span>
      </div>

      <div className="story-grid">
        {storyItems.map((story) => {
          const nickname = story.nickname?.trim() || "אנונימי";
          const isVideo = story.media?.type === "video";

          return (
            <article className="story-card" key={story.id}>
              <div className="story-card-top">
                <div className="story-user-chip">
                  <div className="story-avatar">{nickname[0]}</div>
                  <div className="story-user-meta">
                    <strong>{nickname}</strong>
                    <span>
                      <TimeAgo timestamp={story.timestamp} />
                    </span>
                  </div>
                </div>
              </div>

              <div className="story-media-frame">
                {isVideo ? (
                  <video
                    src={story.media.url}
                    controls
                    preload="metadata"
                    className="story-media-el"
                  />
                ) : (
                  <img
                    src={story.media.url}
                    alt={`story-${nickname}`}
                    className="story-media-el"
                  />
                )}
              </div>

              <div className="story-card-body">
                <p className="story-caption">{story.text || "ללא טקסט"}</p>

                <div className="story-actions">
                  <button
                    type="button"
                    className="story-action-btn primary"
                    onClick={() => onOpenChat?.(nickname)}
                  >
                    💬 צ׳אט
                  </button>

                  {story.location && (
                    <button
                      type="button"
                      className="story-action-btn secondary"
                      onClick={() => onJumpToMap?.(story.location)}
                    >
                      📍 למפה
                    </button>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}