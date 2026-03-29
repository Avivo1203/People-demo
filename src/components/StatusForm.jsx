import React, { useCallback, useMemo, useRef, useState } from "react";
import { ImagePlus, X, Send } from "lucide-react";

/**
 * props:
 * - onAddStatus(newStatus)
 * - userLocation: { latitude, longitude } | null
 */
export default function StatusForm({ onAddStatus, userLocation }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const fileInputRef = useRef(null);

  const currentUser = useMemo(() => {
    try {
      const raw = localStorage.getItem("currentUser");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const displayNickname = useMemo(() => {
    return (
      currentUser?.nickname?.trim() ||
      currentUser?.fullName?.trim() ||
      "אנונימי"
    );
  }, [currentUser]);

  const trimmedText = text.trim();

  const canSubmit = useMemo(() => {
    return trimmedText.length > 0;
  }, [trimmedText]);

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

  const fileToDataUrl = useCallback((file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }, []);

  const handlePickImage = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("אפשר להעלות כרגע רק תמונה.");
      return;
    }

    try {
      const preview = await fileToDataUrl(file);
      setImageFile(file);
      setImagePreview(preview);
    } catch {
      alert("לא הצלחנו לקרוא את התמונה.");
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

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
          nickname: displayNickname,
          text: trimmedText,
          timestamp: nowIso,
          location: loc,
          ...(imagePreview
            ? {
                media: {
                  url: imagePreview,
                  type: "image",
                  name: imageFile?.name || "status-image",
                },
              }
            : {}),
        };

        onAddStatus?.(newStatus);

        setText("");
        clearImage();
      } catch {
        alert("לא הצלחנו לקבל מיקום כרגע. אשר גישה למיקום ונסה שוב.");
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
      imagePreview,
      imageFile,
      onAddStatus,
    ]
  );

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
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
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          aria-label="טקסט הסטטוס"
        />
      </div>

      <div className="status-form-media-row">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          hidden
        />

        <button
          type="button"
          className="status-media-btn"
          onClick={handlePickImage}
          disabled={loading}
        >
          <ImagePlus size={18} strokeWidth={2.3} />
          <span>העלה תמונה</span>
        </button>

        {imagePreview && (
          <div className="status-image-preview-wrap">
            <img
              src={imagePreview}
              alt="preview"
              className="status-image-preview"
            />
            <button
              type="button"
              className="status-image-remove"
              onClick={clearImage}
              title="הסר תמונה"
            >
              <X size={15} strokeWidth={2.5} />
            </button>
          </div>
        )}
      </div>

      <div className="status-form-footer">
        <div className="status-form-note">
          הסטטוס יפורסם עם המיקום שלך, ואם תעלה תמונה היא תצורף לפוסט.
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