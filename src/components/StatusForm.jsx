import React, { useCallback, useMemo, useState } from "react";

/**
 * props:
 * - onAddStatus(newStatus)
 * - userLocation: { latitude, longitude } | null
 */
export default function StatusForm({ onAddStatus, userLocation }) {
  const [nickname, setNickname] = useState(
    () => localStorage.getItem("nickname") || ""
  );
  const [text, setText] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const trimmedNickname = nickname.trim();
  const trimmedText = text.trim();
  const trimmedMediaUrl = mediaUrl.trim();

  const canSubmit = useMemo(() => {
    return trimmedNickname.length > 0 && trimmedText.length > 0;
  }, [trimmedNickname, trimmedText]);

  const resolveLocation = useCallback(() => {
    return new Promise((resolve, reject) => {
      const fallbackLocation =
        userLocation?.latitude && userLocation?.longitude
          ? {
              lat: userLocation.latitude,
              lng: userLocation.longitude,
            }
          : null;

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) =>
            resolve({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            }),
          () => {
            if (fallbackLocation) {
              resolve(fallbackLocation);
            } else {
              reject(new Error("no-location"));
            }
          },
          {
            enableHighAccuracy: true,
            maximumAge: 20000,
            timeout: 10000,
          }
        );
      } else if (fallbackLocation) {
        resolve(fallbackLocation);
      } else {
        reject(new Error("no-location"));
      }
    });
  }, [userLocation]);

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
          nickname: trimmedNickname,
          text: trimmedText,
          timestamp: nowIso,
          location: loc,
          ...(trimmedMediaUrl
            ? {
                media: {
                  url: trimmedMediaUrl,
                  type: /\.(mp4|webm|ogg)$/i.test(trimmedMediaUrl)
                    ? "video"
                    : "image",
                },
              }
            : {}),
        };

        onAddStatus?.(newStatus);
        localStorage.setItem("nickname", trimmedNickname);

        setText("");
        setMediaUrl("");
      } catch {
        alert("לא הצלחנו לקבל מיקום כרגע. אשר גישה למיקום ונסה שוב.");
      } finally {
        setLoading(false);
      }
    },
    [
      canSubmit,
      loading,
      onAddStatus,
      resolveLocation,
      trimmedMediaUrl,
      trimmedNickname,
      trimmedText,
    ]
  );

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <form className="status-form-pro" onSubmit={handleSubmit}>
      <div className="status-form-grid">
        <div className="status-form-field">
          <label>כינוי</label>
          <input
            type="text"
            placeholder="הכינוי שלך"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            disabled={loading}
            aria-label="כינוי"
          />
        </div>

        <div className="status-form-field">
          <label>מדיה לסטורי (לא חובה)</label>
          <input
            type="url"
            placeholder="קישור לתמונה או וידאו"
            value={mediaUrl}
            onChange={(e) => setMediaUrl(e.target.value)}
            disabled={loading}
            aria-label="קישור למדיה"
          />
        </div>
      </div>

      <div className="status-form-field">
        <label>סטטוס</label>
        <textarea
          rows={4}
          placeholder="מה קורה סביבך עכשיו?"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          aria-label="טקסט הסטטוס"
        />
      </div>

      <div className="status-form-footer">
        <div className="status-form-note">
          הסטטוס יישמר עם המיקום שלך, ואם תוסיף מדיה הוא יופיע גם בסטורי.
        </div>

        <button
          type="submit"
          className="status-form-submit"
          disabled={loading || !canSubmit}
        >
          {loading ? "שולח..." : "📨 פרסם סטטוס"}
        </button>
      </div>
    </form>
  );
}