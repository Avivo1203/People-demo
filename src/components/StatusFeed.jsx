import React, { useMemo } from "react";
import TimeAgo from "./TimeAgo";
import { MessageCircle, MapPin, User, Send } from "lucide-react";

/**
 * props:
 * - statuses: array of status objects
 * - comments: array of comment objects
 * - userLocation: { latitude, longitude } | null
 * - onOpenChat(nickname)
 * - onJumpToMap({lat, lng})
 * - onOpenProfile(status)
 * - onOpenStatus(status)
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
  comments = [],
  userLocation,
  onOpenChat,
  onJumpToMap,
  onOpenProfile,
  onOpenStatus,
}) {
  const recentStatuses = useMemo(() => {
    return [...statuses]
      .filter((status) => !!status?.timestamp && !!status?.text)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [statuses]);

  const commentsByStatus = useMemo(() => {
    const map = {};

    for (const comment of comments) {
      if (!map[comment.statusId]) map[comment.statusId] = [];
      map[comment.statusId].push(comment);
    }

    Object.keys(map).forEach((statusId) => {
      map[statusId].sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      );
    });

    return map;
  }, [comments]);

  if (recentStatuses.length === 0) {
    return (
      <div className="status-feed-empty">
        <div className="status-feed-empty-icon">
          <MessageCircle size={28} strokeWidth={2.2} />
        </div>
        <h3>אין עדיין סטטוסים באזור</h3>
        <p>פרסם סטטוס ראשון ותן למסך הזה להרגיש חי.</p>
      </div>
    );
  }

  return (
    <div className="status-feed-grid">
      {recentStatuses.map((status) => {
        const nickname = status.nickname?.trim() || "אנונימי";
        const statusComments = commentsByStatus[status.id] || [];
        const latestComment = statusComments[0];

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
                    <MapPin size={14} strokeWidth={2.2} />
                    <span>{formatDistance(distance)}</span>
                  </span>
                </div>
              </div>
            </header>

            <div
              className="status-post-body"
              onClick={() => onOpenStatus?.(status)}
              style={{ cursor: "pointer" }}
              title="פתח את הסטטוס"
            >
              <p className="status-post-text">{status.text}</p>
            </div>

            <div
              className="status-inline-reply"
              onClick={() => onOpenStatus?.(status)}
              title="הגב לסטטוס"
            >
              <MessageCircle size={17} strokeWidth={2.2} />
              <span>כתוב תגובה...</span>
            </div>

            <div className="status-post-social-summary">
              <button
                type="button"
                className="status-comment-count"
                onClick={() => onOpenStatus?.(status)}
              >
                <MessageCircle size={15} strokeWidth={2.2} />
                <span>{statusComments.length} תגובות</span>
              </button>

              {latestComment && (
                <div className="status-last-comment">
                  <strong>{latestComment.nickname}:</strong>
                  <span>{latestComment.text}</span>
                </div>
              )}
            </div>

            <footer className="status-post-actions">
              <button
                type="button"
                className="status-action-btn primary"
                onClick={() => onOpenStatus?.(status)}
                title="הגב לסטטוס"
              >
                <Send size={16} strokeWidth={2.2} />
                <span>הגב</span>
              </button>

              <button
                type="button"
                className="status-action-btn secondary"
                onClick={() => onOpenChat?.(nickname)}
                title="פתח צ'אט"
              >
                <MessageCircle size={16} strokeWidth={2.2} />
                <span>צ'אט</span>
              </button>

              <button
                type="button"
                className="status-action-btn secondary"
                onClick={() => onOpenProfile?.(status)}
                title="הצג פרופיל"
              >
                <User size={16} strokeWidth={2.2} />
                <span>פרופיל</span>
              </button>

              <button
                type="button"
                className="status-action-btn secondary"
                onClick={() => status.location && onJumpToMap?.(status.location)}
                disabled={!status.location}
                title={status.location ? "קפיצה למיקום במפה" : "אין מיקום זמין"}
              >
                <MapPin size={16} strokeWidth={2.2} />
                <span>מפה</span>
              </button>
            </footer>
          </article>
        );
      })}
    </div>
  );
}