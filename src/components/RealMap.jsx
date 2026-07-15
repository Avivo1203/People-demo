import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
} from "react-leaflet";
import { X, Clock3, MapPin, Search } from "lucide-react";
import L from "leaflet";
import TimeAgo from "./TimeAgo";
import "leaflet/dist/leaflet.css";

function FlyTo({ center, zoom = 14 }) {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom, { duration: 0.9 });
    }
  }, [center, zoom, map]);

  return null;
}

function getDistanceMeters(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) {
    return null;
  }

  const R = 6371e3;
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) *
      Math.cos(phi2) *
      Math.sin(deltaLambda / 2) *
      Math.sin(deltaLambda / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

function formatDistance(distanceM) {
  if (distanceM == null) return "לא ידוע";
  if (distanceM < 1000) return `${distanceM} מטר`;
  return `${(distanceM / 1000).toFixed(2)} ק״מ`;
}

function getSafeDisplayLocation(lat, lng, index = 0) {
  const safeOffset = 0.0015 + index * 0.00035;
  const angle = index * 137.5;
  const angleRad = (angle * Math.PI) / 180;

  return {
    lat: lat + Math.cos(angleRad) * safeOffset,
    lng: lng + Math.sin(angleRad) * safeOffset,
  };
}

export default function RealMap({
  userLocation,
  selectedPlace,
  radius = 1500,
  nearbySearchTrigger = 0,
}) {
  const defaultCenter = useMemo(() => ({ lat: 32.0853, lng: 34.7818 }), []);

  const [center, setCenter] = useState(defaultCenter);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [nearbyPeople, setNearbyPeople] = useState([]);
  const [hasSearchedNearby, setHasSearchedNearby] = useState(false);

  const pulseIcon = useMemo(
    () =>
      L.divIcon({
        className: "pulse-marker",
        html: `<div class="pulse-core"></div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      }),
    []
  );

  const personIcon = useMemo(
    () =>
      L.divIcon({
        className: "person-marker",
        html: `<div class="person-dot"></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      }),
    []
  );

  useEffect(() => {
    if (userLocation?.latitude && userLocation?.longitude) {
      const point = {
        lat: userLocation.latitude,
        lng: userLocation.longitude,
      };

      setSelectedPoint(point);
      setCenter(point);
      setNearbyPeople([]);
      setHasSearchedNearby(false);
    }
  }, [userLocation]);

  useEffect(() => {
    if (selectedPlace?.lat && selectedPlace?.lng) {
      setCenter({
        lat: selectedPlace.lat,
        lng: selectedPlace.lng,
      });
    }
  }, [selectedPlace]);

  useEffect(() => {
    if (!userLocation && !selectedPlace) {
      setSelectedPoint(null);
      setCenter(defaultCenter);
      setNearbyPeople([]);
      setHasSearchedNearby(false);
    }
  }, [userLocation, selectedPlace, defaultCenter]);

  const handleFindPeople = useCallback(async () => {
    if (!selectedPoint) {
      alert("קודם צריך להפעיל מיקום כדי לחפש אנשים סביבך");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("צריך להתחבר למשתמש כדי לחפש אנשים קרובים");
        return;
      }

      const response = await fetch(
        `https://people-demo.onrender.com/api/location/nearby?radius=${radius}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error("Find people failed:", data);
        alert(data.message || "שגיאה בחיפוש אנשים קרובים");
        return;
      }

      const mappedPeople = data
        .filter((user) => user.lat != null && user.lng != null)
        .map((user, index) => {
          const distance = getDistanceMeters(
            selectedPoint.lat,
            selectedPoint.lng,
            user.lat,
            user.lng
          );

          const safeLocation = getSafeDisplayLocation(user.lat, user.lng, index);

          return {
            id: user.id || user.userId,
            userId: user.userId,
            nickname: user.username || "משתמש",
            username: user.username || "משתמש",
            firstName: user.firstName,
            lastName: user.lastName,
            text: "משתמש פעיל באזור",
            timestamp: user.expiresAt || new Date().toISOString(),
            privacyMode: user.privacyMode,
            radius: user.radius,
            realLocation: {
              lat: user.lat,
              lng: user.lng,
            },
            location: safeLocation,
            _distanceM: distance,
          };
        });

      setNearbyPeople(mappedPeople);
      setHasSearchedNearby(true);
      setCenter(selectedPoint);
    } catch (error) {
      console.error("Find nearby error:", error);
      alert("שגיאה בחיבור לשרת בזמן חיפוש אנשים");
    }
  }, [selectedPoint, radius]);

  useEffect(() => {
    if (nearbySearchTrigger > 0) {
      handleFindPeople();
    }
  }, [nearbySearchTrigger, handleFindPeople]);

  const clearSelection = () => {
    setNearbyPeople([]);
    setHasSearchedNearby(false);
    setCenter(selectedPoint || defaultCenter);
  };

  return (
    <div className="realmap-shell">
      <MapContainer
        center={center}
        zoom={13}
        className="realmap-container"
        scrollWheelZoom={true}
      >
        <FlyTo center={center} zoom={14} />

        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        {selectedPoint && (
          <>
            <Marker position={selectedPoint} icon={pulseIcon}>
              <Popup>
                <div className="map-popup-card">
                  <strong className="map-popup-title">המיקום שלי</strong>

                  <span className="map-popup-coords">
                    lat {selectedPoint.lat.toFixed(5)}, lng{" "}
                    {selectedPoint.lng.toFixed(5)}
                  </span>

                  <div className="map-popup-meta">
                    רדיוס פעיל: {radius.toLocaleString()} מטר
                  </div>

                  <button className="map-cta" onClick={handleFindPeople}>
                    <Search size={15} strokeWidth={2.3} />
                    <span>Explore Nearby People</span>
                  </button>
                </div>
              </Popup>
            </Marker>

            <Circle
              center={selectedPoint}
              radius={radius}
              pathOptions={{
                color: "#0ea5e9",
                fillOpacity: 0.08,
              }}
            />
          </>
        )}

        {hasSearchedNearby &&
          nearbyPeople.map((person) => (
            <Marker
              key={`person-${person.id || person.userId}`}
              position={[person.location.lat, person.location.lng]}
              icon={personIcon}
            >
              <Popup>
                <div className="map-popup-card">
                  <strong className="map-popup-title">
                    {person.nickname || "משתמש"}
                  </strong>

                  <div className="map-popup-time">
                    <Clock3 size={13} strokeWidth={2.2} />
                    <TimeAgo timestamp={person.timestamp} />
                  </div>

                  <div className="map-popup-text">
                    {person.text || "משתמש פעיל באזור"}
                  </div>

                  {person._distanceM != null && (
                    <div className="map-popup-meta">
                      <MapPin size={13} strokeWidth={2.2} />
                      <span>מרחק משוער: {formatDistance(person._distanceM)}</span>
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>

      <div className="map-fab-panel">
        {selectedPoint ? (
          <button className="map-fab" onClick={clearSelection}>
            <X size={16} strokeWidth={2.2} />
            <span>אפס חיפוש</span>
          </button>
        ) : (
          <div className="map-hint">הפעל מיקום כדי לחפש אנשים סביבך</div>
        )}
      </div>
    </div>
  );
}