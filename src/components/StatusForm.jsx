import React, { useCallback, useMemo, useState } from "react";
import { Send } from "lucide-react";

const MAX_TEXT_LENGTH = 180;

export default function StatusForm({ onAddStatus, userLocation }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const currentUser = useMemo(() => {
    try {
      const raw =
        localStorage.getItem("user") ||
        localStorage.getItem("currentUser");

      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const displayNickname = useMemo(() => {
    const fullName = `${currentUser?.firstName || ""} ${
      currentUser?.lastName || ""
    }`.trim();

    return (
      currentUser?.username?.trim() ||
      currentUser?.nickname?.trim() ||
      currentUser?.fullName?.trim() ||
      fullName ||
      "אנונימי"
    );
  }, [currentUser]);

  const trimmedText = text.trim();
  const remainingChars = MAX_TEXT_LENGTH - text.length;
  const canSubmit = trimmedText.length > 0;

  const resolveLocation = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (userLocation?.latitude && userLocation?.longitude) {
        resolve({
          lat: userLocation.latitude,
          lng: userLocation.longitude,
        });
        return;
      }

      if (!navigator.geolocation) {
        reject(new Error("no-location"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) =>
          resolve({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          }),
        () => reject(new Error("no-location")),
        {
          enableHighAccuracy: true,
          maximumAge: 20000,
          timeout: 10000,
        }
      );
    });
  }, [userLocation]);

  const handleTextChange = (event) => {
    const value = event.target.value;

    if (value.length <= MAX_TEXT_LENGTH) {
      setText(value);
    }
  };

  const handleSubmit = useCallback(
    async (event) => {
      event?.preventDefault?.();

      if (!canSubmit || loading) return;

      setLoading(true);

      try {
        const loc = await resolveLocation();

        const newStatus = {
          id: Date.now(),
          nickname: displayNickname,
          text: trimmedText,
          timestamp: new Date().toISOString(),
          location: loc,
        };

        onAddStatus?.(newStatus);
        setText("");
      } catch {
        alert("לא הצלחנו לקבל מיקום כרגע. הפעל מיקום ונסה שוב.");
      } finally {
        setLoading(false);
      }
    },
    [
      canSubmit,
      loading,
      resolveLocation,
      displayNickname,
      trimmedText,
      onAddStatus,
    ]
  );

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit(event);
    }
  };

  return (
    <form className="status-form-pro status-form-simple" onSubmit={handleSubmit}>
      <div className="status-form-userline">
        <span className="status-form-userchip">
          מפרסם כ: <strong>{displayNickname}</strong>
        </span>
      </div>

      <div className="status-form-field">
        <label>סטטוס</label>

        <textarea
          rows={4}
          placeholder="מה קורה באזור שלך עכשיו?"
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          disabled={loading}
          maxLength={MAX_TEXT_LENGTH}
          aria-label="טקסט הסטטוס"
        />

        <div className="status-form-counter">
          {remainingChars} תווים נשארו
        </div>
      </div>

      <div className="status-form-footer">
        <div className="status-form-note">
          הסטטוס יפורסם עם המיקום שלך.
        </div>

        <button
          type="submit"
          className="status-form-submit"
          disabled={loading || !canSubmit}
        >
          <Send size={16} strokeWidth={2.4} />
          <span>{loading ? "שולח..." : "פרסם סטטוס"}</span>
        </button>
      </div>
    </form>
  );
}