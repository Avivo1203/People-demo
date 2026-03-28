import React, { useState, useEffect } from "react";

export default function SearchBar({ searchTerm, onSearchChange, onOpenChat, onPlaceSelect }) {
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchTerm.length > 2) {
        fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchTerm)}`
        )
          .then((res) => res.json())
          .then((data) => {
            setSuggestions(data);
            setShowDropdown(true);
          })
          .catch((err) => console.error("🌐 Error fetching places:", err));
      } else {
        setSuggestions([]);
        setShowDropdown(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const handleSelect = (place) => {
    onSearchChange(place.display_name);
    setSuggestions([]);
    setShowDropdown(false);
    if (onPlaceSelect) {
      onPlaceSelect(place);
    }
  };

  return (
    <div className="searchbar">
      <div className="search-shell">
       <input
  className="search-input"
  type="text"              // ❌ במקום search
  autoComplete="off"       // ✅ מונע הצעות אוטומטיות של הדפדפן
  placeholder="חפש מיקום / אזור…"
  value={searchTerm}
  onChange={(e) => onSearchChange(e.target.value)}
  onFocus={() => searchTerm && setShowDropdown(true)}
/>
    
        <span className="search-ico">🔎</span>

        {searchTerm && (
          <button
            className="clear-x"
            type="button"
            aria-label="נקה חיפוש"
            onClick={() => {
              onSearchChange("");
              setSuggestions([]);
              setShowDropdown(false);
            }}
          >
            ×
          </button>
        )}
      </div>

      {showDropdown && suggestions.length > 0 && (
        <div className="search-dropdown">
          {suggestions.map((place) => (
            <div
              key={place.place_id}
              className="search-result"
              onClick={() => handleSelect(place)}
            >
              <div className="result-title">{place.display_name.split(",")[0]}</div>
              <div className="result-sub">{place.display_name}</div>
            </div>
          ))}
        </div>
      )}

    
    </div>
  );
}
