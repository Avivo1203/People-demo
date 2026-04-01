import React from "react";

export default function StatusFeed({ statuses = [], onOpenChat, onJumpToMap, onOpenStatus }) {
  if (statuses.length === 0) {
    return (
      <div className="status-feed-empty">
        <div className="status-feed-empty-icon">📍</div>
        <h3>אין סטטוסים בסביבה</h3>
        <p>היה הראשון לעדכן מה קורה ברדיוס שלך!</p>
      </div>
    );
  }

  return (
    <div className="status-feed-grid">
      {statuses.map((status) => (
        <article key={status._id || Math.random()} className="status-post-card">
          <div className="status-post-head">
            <div className="status-post-avatar">
              {status.avatar || "👤"}
            </div>
            <div className="status-post-user">
              <div className="status-post-topline">
                <strong className="status-post-name">{status.nickname}</strong>
                <span className="status-post-dot">•</span>
                <span className="status-post-time">{status.timeAgo || 'עכשיו'}</span>
              </div>
              <div className="status-post-meta">
                <span className="status-post-badge">
                  {status.type === 'help' ? '🆘 עזרה' : status.type === 'event' ? '🎉 אירוע' : '💬 כללי'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="status-post-body" onClick={() => onOpenStatus(status)}>
            <p className="status-post-text">{status.text || status.status}</p>
          </div>

          <div className="status-post-actions">
            <button className="status-action-btn primary" onClick={() => onOpenChat(status.nickname)}>
              💬 צ'אט
            </button>
            <button className="status-action-btn secondary" onClick={() => onJumpToMap(status)}>
              📍 במפה
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}