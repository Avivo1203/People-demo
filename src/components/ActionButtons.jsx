import React from "react";

export default function ActionButtons({ onGoHome, onClear, onGetLocation }) {
  const handleLocation = () => {
    if (!navigator.geolocation) {
      alert('⚠️ הדפדפן שלך לא תומך במיקום גיאוגרפי.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onGetLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
      () => alert('⚠️ לא הצלחנו לקבל את המיקום. אנא אפשר/י גישה.')
    );
  };

  return (
    <div className="action-buttons-container">
      <button onClick={onGoHome}>🏠 דף הבית</button>
      <button onClick={handleLocation}>📍 מיקום נוכחי</button>
      <button onClick={onClear}>🧹 נקה הכל</button>
    </div>
  );
}
