import React, { useCallback, useMemo, useState } from "react";

/**
 * טופס שליחה מודרני:
 * - שולח סטטוס עם מיקום אמיתי (Geolocation) או נופל חזרה ל-userLocation מה-Props
 * - Enter = שליחה | Shift+Enter = ירידת שורה
 * - שומר את הכינוי ב-localStorage
 * - תומך אופציונלית בקישור מדיה (תמונה/וידאו) כדי שייכנס גם ל"סטורי"
 *
 * props:
 * - onAddStatus(newStatus)
 * - userLocation: { latitude, longitude } | null
 */
export default function StatusForm({ onAddStatus, userLocation }) {
  const [nickname, setNickname] = useState(() => localStorage.getItem("nickname") || "");
  const [text, setText] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(() => nickname.trim() && text.trim(), [nickname, text]);

  const resolveLocation = useCallback(
    () =>
      new Promise((resolve, reject) => {
        // קודם ננסה GPS אמיתי
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) =>
              resolve({
                lat: pos.coords.latitude,
                lng: pos.coords.longitude,
              }),
            () => {
              // אם נכשל – ננסה userLocation מה-Props
              if (userLocation?.latitude && userLocation?.longitude) {
                resolve({ lat: userLocation.latitude, lng: userLocation.longitude });
              } else {
                reject(new Error("no-location"));
              }
            },
            { enableHighAccuracy: true, maximumAge: 20_000, timeout: 10_000 }
          );
        } else if (userLocation?.latitude && userLocation?.longitude) {
          resolve({ lat: userLocation.latitude, lng: userLocation.longitude });
        } else {
          reject(new Error("no-location"));
        }
      }),
    [userLocation]
  );

  const handleSubmit = useCallback(
    async (e) => {
      e?.preventDefault?.();
      if (!canSubmit || loading) return;

      setLoading(true);
      try {
        const loc = await resolveLocation();
        const nowIso = new Date().toISOString();

        const newStatus = {
          id: Date.now(),
          nickname: nickname.trim(),
          text: text.trim(),
          timestamp: nowIso,
          location: loc, // {lat, lng}
          ...(mediaUrl.trim()
            ? {
                media: {
                  url: mediaUrl.trim(),
                  // זיהוי פשוט: אם URL נגמר ב־mp4/webm → וידאו, אחרת תמונה
                  type: /\.(mp4|webm)$/i.test(mediaUrl.trim()) ? "video" : "image",
                },
              }
            : {}),
        };

        onAddStatus?.(newStatus);
        localStorage.setItem("nickname", nickname.trim());
        setText("");
        setMediaUrl("");
      } catch {
        alert("⚠️ לא הצלחנו לקבל את המיקום כרגע. נסו שוב מהאזור הפתוח או אשרו גישה למיקום.");
      } finally {
        setLoading(false);
      }
    },
    [canSubmit, loading, nickname, text, mediaUrl, onAddStatus, resolveLocation]
  );

  // Enter = שליחה | Shift+Enter = ירידת שורה
  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <form className="status-form-new" onSubmit={handleSubmit}>
      <div style={{ display: "grid", gap: 8 }}>
        <div style={{ display: "grid", gap: 8, gridTemplateColumns: "1fr 2fr" }}>
          <input
            type="text"
            placeholder="👤 הכינוי שלך"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            disabled={loading}
            aria-label="כינוי"
          />
          <input
            type="url"
            placeholder="🔗 קישור למדיה (לא חובה) – תמונה/וידאו"
            value={mediaUrl}
            onChange={(e) => setMediaUrl(e.target.value)}
            disabled={loading}
            aria-label="קישור למדיה"
          />
        </div>

        <textarea
          placeholder="מה קורה אצלך עכשיו? ✍️ (Enter לשליחה · Shift+Enter לשורה חדשה)"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={loading}
          aria-label="טקסט הסטטוס"
        />

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button type="submit" disabled={loading || !canSubmit}>
            {loading ? "שולח…" : "📨 שלח סטטוס"}
          </button>

          <span style={{ fontSize: 12, color: "#64748b" }}>
            הסטטוס יישלח עם המיקום שלך (0 מטר ממך כרגע) ויופיע בפיד · ואם יש מדיה – גם בסטורי.
          </span>
        </div>
      </div>
    </form>
  );
}
