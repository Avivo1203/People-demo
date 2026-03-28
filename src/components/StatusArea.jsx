import React, { useState } from "react";
import StatusForm from "./StatusForm";
import StatusFeed from "./StatusFeed";
import StoryGrid from "./StoryGrid";

/**
 * ⚠️ Stubs זמניים כדי שלא יהיו שגיאות עד שנוסיף את הקבצים האמיתיים:
 * תחליף אותם בהדבקות הבאות:
 * - StatusForm.jsx
 * - StatusFeed.jsx
 * - StoryGrid.jsx
 */
function StatusFormStub({ onAddStatus }) {
  return (
    <div className="status-form-new" style={{ borderBottom: "1px solid #e2e8f0" }}>
      <div style={{ fontWeight: 800, color: "#0f172a" }}>📝 טופס סטטוס</div>
      <div style={{ fontSize: 13, color: "#64748b" }}>
        תכף תודבק כאן הקומפוננטה <code>StatusForm.jsx</code>.
      </div>
      <button
        className="map-cta"
        style={{ marginTop: 8 }}
        onClick={() => onAddStatus?.({
          id: Date.now(),
          nickname: "אני",
          text: "דוגמה זמנית עד שנדביק את StatusForm.jsx",
          timestamp: new Date().toISOString(),
          location: null,
        })}
      >
        הוסף סטטוס לדוגמה
      </button>
    </div>
  );
}

function StatusFeedStub({ statuses = [], onOpenChat, onJumpToMap }) {
  return (
    <div className="status-list-wrapper">
      {statuses.length === 0 ? (
        <div className="center" style={{ padding: "1.2rem", color: "#64748b" }}>
          אין סטטוסים עדיין. תכף נכניס את <code>StatusFeed.jsx</code>.
        </div>
      ) : (
        <div className="feed-list">
          {statuses.map((s) => (
            <article key={s.id} className="status-card">
              <header className="status-head">
                <div className="avatar-mini">{(s.nickname || "א")[0]}</div>
                <div className="who-when">
                  <strong className="nick">{s.nickname || "משתמש"}</strong>
                  <div className="meta-line">
                    <span style={{ fontSize: 12, color: "#64748b" }}>
                      {new Date(s.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              </header>
              <p className="status-text">{s.text}</p>
              <footer className="status-actions-row">
                <button className="map-cta" onClick={() => onOpenChat?.(s.nickname || "משתמש")}>💬 צ׳אט</button>
                <button
                  className="map-cta"
                  onClick={() => s.location && onJumpToMap?.(s.location)}
                  disabled={!s.location}
                  title={s.location ? "קפיצה למפה" : "אין מיקום משויך"}
                >
                  🗺️ למפה
                </button>
              </footer>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function StoryGridStub({ statuses = [], onOpenChat, onJumpToMap }) {
  return (
    <div className="status-list-wrapper">
      <div className="center" style={{ padding: "1.2rem", color: "#64748b" }}>
        כאן יוצגו סטוריז (תמונות/וידאו) מה־30 דקות האחרונות.
        <br />
        תכף נדביק את <code>StoryGrid.jsx</code>.
      </div>
    </div>
  );
}

/**
 * ✅ StatusArea – גרסה משודרגת (מסך מלא)
 * props:
 * - statuses: Array
 * - userLocation: { latitude, longitude } | null
 * - onAddStatus: (newStatus) => void
 * - onOpenChat: (nickname) => void
 * - onJumpToMap: ({lat, lng}) => void   // לקפיצה למפה ממסך הסטטוסים
 */
export default function StatusArea({
  statuses = [],
  userLocation,
  onAddStatus,
  onOpenChat,
  onJumpToMap,
  
}) {

  const [activeTab, setActiveTab] = useState("feed"); // 'feed' | 'story' | 'good'

  return (
    <div className="status-fullscreen">
        <div className="status-subtabs">
  <button className={activeTab==="feed"?"active":""} onClick={()=>setActiveTab("feed")}>פיד</button>
  <button className={activeTab==="story"?"active":""} onClick={()=>setActiveTab("story")}>סטורי</button>
  <button className={activeTab==="good"?"active":""} onClick={()=>setActiveTab("good")}>מעשים טובים</button>
</div>

      {/* 🔝 טאבים עליונים (pill) */}
      <div className="status-tabs">
        <button
          className={activeTab === "feed" ? "active" : ""}
          onClick={() => setActiveTab("feed")}
        >
          📰 פיד
        </button>
        <button
          className={activeTab === "story" ? "active" : ""}
          onClick={() => setActiveTab("story")}
        >
          📸 סטורי
        </button>
        <button
          className={activeTab === "good" ? "active" : ""}
          onClick={() => setActiveTab("good")}
          disabled
          title="בקרוב: מעשים טובים"
        >
          💙 מעשים טובים
        </button>
      </div>

      {/* 📝 טופס שליחת סטטוס (עם מיקום) */}
<StatusForm onAddStatus={onAddStatus} userLocation={userLocation} />

     <div className="status-tab-content">
  {activeTab === "feed" && (
    <StatusFeed
      statuses={statuses}
      userLocation={userLocation}
      onOpenChat={onOpenChat}
      onJumpToMap={onJumpToMap}
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
    <div className="center" style={{ padding: "2rem", color: "#64748b" }}>
      🔧 בקרוב: דירוג מעשים טובים…
    </div>
  )}
</div>

    </div>
  );
}
