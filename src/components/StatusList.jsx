import React, { useState } from "react";
import TimeAgo from "./TimeAgo";

export default function StatusList({ statuses = [], onAddStatus, onOpenChat }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [nickname, setNickname] = useState("");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nickname.trim() || !text.trim()) return;
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onAddStatus({
          id: Date.now(),
          nickname: nickname.trim(),
          text: text.trim(),
          timestamp: new Date().toISOString(),
          location: {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          },
        });
        setText("");
        setLoading(false);
      },
      () => {
        alert("⚠️ לא הצלחנו לקבל את המיקום.");
        setLoading(false);
      }
    );
  };

  const filteredStatuses = statuses.filter(
    (status) =>
      status.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (status.nickname || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="status-list-container" style={{ padding: "1rem" }}>
      {/* 🔍 שורת חיפוש */}
      <div style={{ marginBottom: "1rem" }}>
        <input
          type="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="🔍 חפש סטטוס או כינוי..."
          className="mini-search"
        />
      </div>

      {/* 📝 טופס סטטוס חדש */}
      <form className="status-form" onSubmit={handleSubmit} style={{ marginBottom: "1.5rem", display: "grid", gap: "0.5rem" }}>
        <input
          type="text"
          placeholder="👤 כינוי"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          disabled={loading}
          className="mini-search"
        />
        <input
          type="text"
          placeholder="מה קורה? 😎"
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={loading}
          className="mini-search"
        />
        <button className="map-cta" type="submit" disabled={loading}>
          {loading ? "🚀 שולח..." : "📨 שלח סטטוס"}
        </button>
      </form>

      {/* 📋 סטטוסים קיימים */}
      <div className="feed-list">
        {filteredStatuses.length > 0 ? (
          filteredStatuses.map((status) => {
            const nick = status.nickname?.trim() || "אנונימי";
            return (
              <article key={status.id} className="status-card">
                <header className="status-head">
                  <div className="avatar-mini">{nick[0]}</div>
                  <div className="who-when">
                    <strong className="nick">{nick}</strong>
                    <div className="meta-line">
                      <TimeAgo timestamp={status.timestamp} />
                    </div>
                  </div>
                </header>
                <p className="status-text">{status.text}</p>
                <footer className="status-actions-row">
                  <button className="map-cta" onClick={() => onOpenChat(nick)}>💬 צ׳אט</button>
                </footer>
              </article>
            );
          })
        ) : (
          <div className="center" style={{ color: "#64748b", padding: "1rem" }}>
            😕 לא נמצאו סטטוסים תואמים
          </div>
        )}
      </div>
    </div>
  );
}
