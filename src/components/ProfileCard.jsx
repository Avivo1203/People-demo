import React, { useMemo } from "react";
import "./ProfileCard.css";

export default function ProfileCard({
  user,
  onClose,
  onEdit,
}) {
  const safeUser = user || {};

  const initials = useMemo(() => {
    const source =
      safeUser.fullName?.trim() ||
      safeUser.nickname?.trim() ||
      "People";

    const parts = source.split(/\s+/);
    return ((parts[0]?.[0] || "P") + (parts[1]?.[0] || "")).toUpperCase();
  }, [safeUser.fullName, safeUser.nickname]);

  const displayName =
    safeUser.fullName?.trim() ||
    safeUser.nickname?.trim() ||
    "משתמש אנונימי";

  const username =
    safeUser.nickname?.trim() ||
    "people_user";

  const bio =
    safeUser.bio?.trim() ||
    "עדיין לא נוסף סטטוס אישי. כאן יהיה מקום לטקסט קצר על המשתמש.";

  const locationLabel =
    safeUser.city?.trim() ||
    safeUser.area?.trim() ||
    "אזור לא הוגדר";

  const goodDeeds = safeUser.goodDeeds ?? 0;
  const statusCount = safeUser.statusCount ?? 0;
  const storyCount = safeUser.storyCount ?? 0;

  return (
    <div className="profile-card-overlay" onClick={onClose}>
      <div
        className="profile-card"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        <div className="profile-card-top-glow profile-card-top-glow-one" />
        <div className="profile-card-top-glow profile-card-top-glow-two" />

        <div className="profile-card-header">
          <button
            type="button"
            className="profile-card-close"
            onClick={onClose}
            aria-label="סגור פרופיל"
            title="סגור"
          >
            ✕
          </button>

          <div className="profile-card-cover">
            <div className="profile-card-avatar-wrap">
              <div className="profile-card-avatar">
                {safeUser.avatarUrl ? (
                  <img src={safeUser.avatarUrl} alt={displayName} />
                ) : (
                  <span>{initials}</span>
                )}
              </div>
            </div>
          </div>

          <div className="profile-card-main">
            <div className="profile-card-name-row">
              <h2>{displayName}</h2>
              <span className="profile-card-verified">✨</span>
            </div>

            <div className="profile-card-username">@{username}</div>

            <p className="profile-card-bio">{bio}</p>

            <div className="profile-card-tags">
              <span className="profile-tag">📍 {locationLabel}</span>
              <span className="profile-tag">💬 פעיל באזור</span>
              <span className="profile-tag">🛰️ People Local</span>
            </div>
          </div>
        </div>

        <div className="profile-card-stats">
          <div className="profile-stat-box">
            <strong>{statusCount}</strong>
            <span>סטטוסים</span>
          </div>

          <div className="profile-stat-box">
            <strong>{storyCount}</strong>
            <span>סטוריז</span>
          </div>

          <div className="profile-stat-box">
            <strong>{goodDeeds}</strong>
            <span>מעשים טובים</span>
          </div>
        </div>

        <div className="profile-card-section">
          <div className="profile-card-section-title">כרטיס משתמש</div>

          <div className="profile-card-info-grid">
            <div className="profile-info-item">
              <span className="label">כינוי</span>
              <strong>{safeUser.nickname || "לא הוגדר"}</strong>
            </div>

            <div className="profile-info-item">
              <span className="label">אזור</span>
              <strong>{locationLabel}</strong>
            </div>

            <div className="profile-info-item">
              <span className="label">סטטוס אישי</span>
              <strong>{safeUser.mood || "זמין לצ׳אט"}</strong>
            </div>

            <div className="profile-info-item">
              <span className="label">סגנון</span>
              <strong>{safeUser.vibe || "חברתי / מקומי"}</strong>
            </div>
          </div>
        </div>

        <div className="profile-card-actions">
          <button
            type="button"
            className="profile-primary-btn"
            onClick={onEdit}
          >
            ✏️ ערוך פרופיל
          </button>

          <button
            type="button"
            className="profile-secondary-btn"
            onClick={onClose}
          >
            סגור
          </button>
        </div>
      </div>
    </div>
  );
}