import React, { useState } from "react";
import { User, House, MapPinned, LoaderCircle, Trash2 } from "lucide-react";
import NavTabs from "./NavTabs";
import SearchBar from "./SearchBar";

export default function TopBar({
  activeTab, onChangeTab, radius, setRadius, searchTerm, onSearchChange,
  onGoHome, onClear, onGetLocation, onPlaceSelect, onOpenProfile, onOpenChat
}) {
  const [isLocating, setIsLocating] = useState(false);

  const handleLocation = () => {
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition((pos) => {
      onGetLocation?.({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
      setIsLocating(false);
    }, () => setIsLocating(false), { enableHighAccuracy: true });
  };

  return (
    <div className={`topbar-shell ${activeTab === "status" ? "topbar-shell-status" : "topbar-shell-map"}`}>
      <div className="topbar-stack">
        <NavTabs activeTab={activeTab} onChangeTab={onChangeTab} radius={radius} onRadiusChange={setRadius} />
        <div className="topbar-row">
          <SearchBar searchTerm={searchTerm} onSearchChange={onSearchChange} onPlaceSelect={onPlaceSelect} onOpenChat={onOpenChat} />
          <div className="topbar-actions">
            <button onClick={onOpenProfile} className="topbar-action-btn profile"><User size={19} /></button>
            <button onClick={onGoHome} className="topbar-action-btn"><House size={19} /></button>
            <button onClick={handleLocation} disabled={isLocating} className="topbar-action-btn">
              {isLocating ? <LoaderCircle size={19} className="spin" /> : <MapPinned size={19} />}
            </button>
            <button onClick={onClear} className="topbar-action-btn"><Trash2 size={19} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}