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
  const [isSelecting, setIsSelecting] = useState(false);

  useEffect(() => {
    if (isSelecting) return;

    const delayDebounce = setTimeout(() => {
      if (searchTerm.trim().length > 2) {
        fetch(
          `https://nominatim.openstreetmap.org/search?format=json&limit=6&q=${encodeURIComponent(
            searchTerm
          )}`
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
  }, [searchTerm, isSelecting]);

  const handleSelect = (place) => {
    const lat = parseFloat(place.lat);
    const lon = parseFloat(place.lon);

    if (Number.isNaN(lat) || Number.isNaN(lon)) {
      console.error("Invalid place coordinates:", place);
      return;
    }

    setIsSelecting(true);

    onPlaceSelect?.({
      ...place,
      lat,
      lon,
      display_name: place.display_name || "מיקום שנבחר",
    });

    onSearchChange?.(place.display_name || "");
    setSuggestions([]);
    setShowDropdown(false);

    setTimeout(() => {
      setIsSelecting(false);
    }, 300);
  };

  const handleClear = () => {
    onSearchChange?.("");
    setSuggestions([]);
    setShowDropdown(false);
  };

  return (
    <div className="searchbar-shell">
      <div className="searchbar-input-wrap">
        <input
          type="text"
          autoComplete="off"
          placeholder="חפש מיקום / אזור…"
          value={searchTerm}
          onChange={(e) => onSearchChange?.(e.target.value)}
          onFocus={() => {
            if (searchTerm.trim().length > 2 && suggestions.length > 0) {
              setShowDropdown(true);
            }
          }}
          className="searchbar-input"
        />

        <span className="searchbar-icon">
          <Search size={18} strokeWidth={2.2} />
        </span>

        {searchTerm && (
          <button
            type="button"
            aria-label="נקה חיפוש"
            onClick={handleClear}
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
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelect(place)}
              className="searchbar-result"
            >
              <div className="searchbar-result-icon">
                <MapPin size={16} strokeWidth={2.2} />
              </div>

              <div className="searchbar-result-content">
                <div className="searchbar-result-title">
                  {place.display_name?.split(",")[0] || "מיקום"}
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