import React, { useState } from "react";
import TimeAgo from "./TimeAgo";
import { X, MapPin, MessageCircle, Send } from "lucide-react";

export default function StatusDetails({
  status,
  comments = [],
  onAddComment,
  onClose,
}) {
  const [commentText, setCommentText] = useState("");

  if (!status) return null;

  const nickname = status.nickname?.trim() || "משתמש";

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    onAddComment?.(status.id, commentText);
    setCommentText("");
  };

  return (
    <div className="status-details-overlay" onClick={onClose}>
      <div
        className="status-details-modal clean-status-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="status-details-close"
          onClick={onClose}
          title="סגור"
        >
          <X size={18} strokeWidth={2.4} />
        </button>

        <div className="status-details-header">
          <div className="status-details-user-block">
            <div className="status-details-avatar">{nickname[0]}</div>

            <div className="status-details-user-info">
              <h3>{nickname}</h3>
              <span className="status-details-time">
                <TimeAgo timestamp={status.timestamp} />
              </span>
            </div>
          </div>
        </div>

        <div className="status-details-body clean-status-body">
          <p>{status.text}</p>
        </div>

        <div className="status-details-footer clean-status-footer">
          {status.location ? (
            <span className="status-details-location">
              <MapPin size={15} strokeWidth={2.2} />
              <span>
                {status.location.lat?.toFixed?.(4)},{" "}
                {status.location.lng?.toFixed?.(4)}
              </span>
            </span>
          ) : (
            <span className="status-details-location muted">ללא מיקום</span>
          )}

          <span className="status-details-comments-count">
            <MessageCircle size={15} strokeWidth={2.2} />
            <span>{comments.length} תגובות</span>
          </span>
        </div>

        <div className="status-details-reply-box clean-reply-box">
          <form className="status-comment-form" onSubmit={handleSubmit}>
            <textarea
              className="status-comment-input"
              placeholder="כתוב תגובה לסטטוס..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              rows={3}
            />

            <button
              type="submit"
              className="status-comment-submit"
              disabled={!commentText.trim()}
            >
              <Send size={16} strokeWidth={2.2} />
              <span>שלח</span>
            </button>
          </form>

          <div className="status-comments-list">
            {comments.length === 0 ? (
              <div className="status-comments-empty">
                אין תגובות עדיין. תהיה הראשון להגיב.
              </div>
            ) : (
              comments.map((comment) => (
                <div className="status-comment-item" key={comment.id}>
                  <div className="status-comment-top">
                    <strong>{comment.nickname || "משתמש"}</strong>
                    <span>
                      <TimeAgo timestamp={comment.timestamp} />
                    </span>
                  </div>

                  <p className="status-comment-text">{comment.text}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}