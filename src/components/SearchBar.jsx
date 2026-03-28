import React, { useEffect, useState } from "react";

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
          )}`
        )
          .then((res) => res.json())
          .then((data) => {
            setSuggestions(data || []);
            setShowDropdown(true);
          })
          .catch((err) => {
            console.error("🌐 Error fetching places:", err);
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
    onSearchChange(place.display_name);
    setSuggestions([]);
    setShowDropdown(false);
    onPlaceSelect?.(place);
  };

  const shellStyle = {
    position: "relative",
    width: "100%",
  };

  const inputWrapStyle = {
    position: "relative",
    display: "flex",
    alignItems: "center",
    width: "100%",
    minHeight: "64px",
    borderRadius: "22px",
    background: "rgba(255,255,255,0.76)",
    backdropFilter: "blur(18px)",
    WebkitBackdropFilter: "blur(18px)",
    border: "1px solid rgba(255,255,255,0.55)",
    boxShadow: "0 10px 28px rgba(15,23,42,0.10)",
    overflow: "hidden",
  };

  const inputStyle = {
    width: "100%",
    border: "none",
    outline: "none",
    background: "transparent",
    fontSize: "16px",
    fontWeight: 600,
    color: "#0f172a",
    padding: "0 52px 0 52px",
    height: "64px",
    direction: "rtl",
  };

  const searchIconStyle = {
    position: "absolute",
    left: "16px",
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: "18px",
    opacity: 0.7,
    pointerEvents: "none",
  };

  const clearBtnStyle = {
    position: "absolute",
    right: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    width: "34px",
    height: "34px",
    border: "none",
    borderRadius: "12px",
    background: "rgba(15,23,42,0.06)",
    cursor: "pointer",
    fontSize: "20px",
    color: "#334155",
  };

  const dropdownStyle = {
    position: "absolute",
    top: "calc(100% + 10px)",
    right: 0,
    left: 0,
    background: "rgba(255,255,255,0.96)",
    backdropFilter: "blur(18px)",
    WebkitBackdropFilter: "blur(18px)",
    border: "1px solid rgba(255,255,255,0.7)",
    borderRadius: "20px",
    boxShadow: "0 18px 40px rgba(15,23,42,0.16)",
    overflow: "hidden",
    zIndex: 999,
    maxHeight: "320px",
    overflowY: "auto",
  };

  const resultStyle = {
    padding: "14px 16px",
    borderBottom: "1px solid rgba(226,232,240,0.75)",
    cursor: "pointer",
    transition: "background 0.2s ease",
  };

  const titleStyle = {
    fontSize: "14px",
    fontWeight: 800,
    color: "#0f172a",
    marginBottom: "4px",
  };

  const subStyle = {
    fontSize: "12px",
    color: "#64748b",
    lineHeight: 1.4,
  };

  return (
    <div style={shellStyle}>
      <div style={inputWrapStyle}>
        <input
          type="text"
          autoComplete="off"
          placeholder="חפש מיקום / אזור…"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          onFocus={() => searchTerm && setShowDropdown(true)}
          style={inputStyle}
        />

        <span style={searchIconStyle}>🔎</span>

        {searchTerm && (
          <button
            type="button"
            aria-label="נקה חיפוש"
            onClick={() => {
              onSearchChange("");
              setSuggestions([]);
              setShowDropdown(false);
            }}
            style={clearBtnStyle}
          >
            ×
          </button>
        )}
      </div>

      {showDropdown && suggestions.length > 0 && (
        <div style={dropdownStyle}>
          {suggestions.map((place) => (
            <div
              key={place.place_id}
              onClick={() => handleSelect(place)}
              style={resultStyle}
            >
              <div style={titleStyle}>
                {place.display_name.split(",")[0]}
              </div>
              <div style={subStyle}>{place.display_name}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}