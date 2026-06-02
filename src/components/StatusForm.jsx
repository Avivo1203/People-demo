import React, { useCallback, useMemo, useRef, useState } from "react";
import { ImagePlus, X, Send } from "lucide-react";

const MAX_TEXT_LENGTH = 180;
const MAX_IMAGE_SIZE_MB = 3;
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;

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
  const remainingChars = MAX_TEXT_LENGTH - text.length;
  const canSubmit = trimmedText.length > 0 || !!imagePreview;

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

  const handleImageChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("אפשר להעלות כרגע רק תמונה.");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      alert(`התמונה גדולה מדי. אפשר להעלות עד ${MAX_IMAGE_SIZE_MB}MB.`);
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
      imagePreview,
      imageFile,
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
              alt="תצוגה מקדימה"
              className="status-image-preview"
            />

            <button
              type="button"
              className="status-image-remove"
              onClick={clearImage}
              title="הסר תמונה"
              aria-label="הסר תמונה"
            >
              <X size={15} strokeWidth={2.5} />
            </button>
          </div>
        )}
      </div>

      <div className="status-form-footer">
        <div className="status-form-note">
          הסטטוס יפורסם עם המיקום שלך. אפשר לפרסם טקסט, תמונה או שניהם.
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