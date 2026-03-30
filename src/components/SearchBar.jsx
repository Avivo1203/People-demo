import React, { useEffect, useState } from "react";
import { Search, X, MapPin } from "lucide-react";

export default function SearchBar({
  searchTerm,
  onSearchChange,
  onOpenChat,
  onPlaceSelect,
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchTerm.trim().length > 2) {
        fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            searchTerm
          )}&limit=5&countrycodes=il` // הגבלה לישראל לדיוק מירבי
        )
          .then((res) => res.json())
          .then((data) => {
            setSuggestions(data || []);
            setShowDropdown(true);
          })
          .catch((err) => {
            console.error("Error fetching places:", err);
            setSuggestions([]);
            setShowDropdown(false);
          });
      } else {
        setSuggestions([]);
        setShowDropdown(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const handleSelect = (place) => {
    // עדכון הטקסט בשדה לכתובת שנבחרה
    onSearchChange(place.display_name);
    setSuggestions([]);
    setShowDropdown(false);

    // שליחת המיקום ל-App.jsx עם המרה למספרים
    if (onPlaceSelect) {
      onPlaceSelect({
        lat: parseFloat(place.lat),
        lon: parseFloat(place.lon),
        display_name: place.display_name
      });
    }
  };

  return (
    <div className="searchbar-shell">
      <div className="searchbar-input-wrap">
        <input
          type="text"
          autoComplete="off"
          placeholder="חפש מיקום / אזור…"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          onFocus={() => searchTerm && setShowDropdown(true)}
          className="searchbar-input"
        />

        <span className="searchbar-icon">
          <Search size={18} strokeWidth={2.2} />
        </span>

        {searchTerm && (
          <button
            type="button"
            aria-label="נקה חיפוש"
            onClick={() => {
              onSearchChange("");
              setSuggestions([]);
              setShowDropdown(false);
            }}
            className="searchbar-clear-btn"
          >
            <X size={18} strokeWidth={2.4} />
          </button>
        )}
      </div>

      {showDropdown && suggestions.length > 0 && (
        <div className="searchbar-dropdown">
          {suggestions.map((place) => (
            <button
              type="button"
              key={place.place_id}
              onClick={() => handleSelect(place)}
              className="searchbar-result"
            >
              <div className="searchbar-result-icon">
                <MapPin size={16} strokeWidth={2.2} />
              </div>

              <div className="searchbar-result-content">
                <div className="searchbar-result-title">
                  {place.display_name.split(",")[0]}
                </div>
                <div className="searchbar-result-subtitle">
                  {place.display_name}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}