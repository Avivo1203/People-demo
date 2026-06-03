import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
} from "react-leaflet";
import { MessageCircle, Search, X, Send, Clock3 } from "lucide-react";
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

function haversineMeters(a, b) {
  const toRad = (d) => (d * Math.PI) / 180;
  const R = 6371000;

  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const x =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  return R * c;
}

function formatDistance(distanceM) {
  if (distanceM == null) return "לא ידוע";
  if (distanceM < 1000) return `${Math.round(distanceM)} מטר`;
  return `${(distanceM / 1000).toFixed(2)} ק״מ`;
}

export default function RealMap({
  statuses = [],
  comments = [],
  onOpenStatus,
  userLocation,
  selectedPlace,
  radius = 1500,
  nearbySearchTrigger,
}) {
  const defaultCenter = useMemo(() => ({ lat: 32.0853, lng: 34.7818 }), []);

  const [center, setCenter] = useState(defaultCenter);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [nearby, setNearby] = useState([]);
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
      setNearby([]);
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
      setNearby([]);
      setHasSearchedNearby(false);
      setCenter(defaultCenter);
    }
  }, [userLocation, selectedPlace, defaultCenter]);

  const commentsMetaByStatus = useMemo(() => {
    const map = {};

    for (const comment of comments) {
      if (!map[comment.statusId]) {
        map[comment.statusId] = {
          count: 0,
          latest: null,
        };
      }

      map[comment.statusId].count += 1;

      if (
        !map[comment.statusId].latest ||
        new Date(comment.timestamp) >
          new Date(map[comment.statusId].latest.timestamp)
      ) {
        map[comment.statusId].latest = comment;
      }
    }

    return map;
  }, [comments]);

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
        `http://localhost:5000/api/location/nearby?radius=${radius}`,
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

      const mappedUsers = data
        .filter((user) => user.lat != null && user.lng != null)
        .map((user, index) => {
          const distance = haversineMeters(selectedPoint, {
            lat: user.lat,
            lng: user.lng,
          });

          const visualDistance = 0.0025 + index * 0.0007;

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
            location: {
              lat: selectedPoint.lat + visualDistance,
              lng: selectedPoint.lng + visualDistance,
            },
            _distanceM: distance,
          };
        })
        .sort((a, b) => a._distanceM - b._distanceM);

      console.log("Nearby users:", mappedUsers);

      setNearby(mappedUsers);
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
    setNearby([]);
    setHasSearchedNearby(false);
    setCenter(selectedPoint || defaultCenter);
  };

  const displayedStatuses = hasSearchedNearby ? nearby : [];

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
                    <span>חפש אנשים קרובים</span>
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

        {displayedStatuses.map((status) => {
          const commentMeta = commentsMetaByStatus[status.id] || {
            count: 0,
            latest: null,
          };

          return (
            <Marker
              key={status.id || status.userId}
              position={[status.location.lat, status.location.lng]}
              icon={personIcon}
            >
              <Popup>
                <div className="map-popup-card">
                  <strong className="map-popup-title">
                    {status.nickname || "משתמש"}
                  </strong>

                  <div className="map-popup-time">
                    <Clock3 size={13} strokeWidth={2.2} />
                    <TimeAgo timestamp={status.timestamp} />
                  </div>

                  <div className="map-popup-text">
                    {status.text || "משתמש פעיל באזור"}
                  </div>

                  {status._distanceM != null && (
                    <div className="map-popup-meta">
                      מרחק אמיתי: {formatDistance(status._distanceM)}
                    </div>
                  )}

                  <div className="map-popup-comment-chip">
                    <MessageCircle size={14} strokeWidth={2.2} />
                    <span>{commentMeta.count} תגובות</span>
                  </div>

                  {commentMeta.latest && (
                    <div className="map-popup-last-comment">
                      <strong>{commentMeta.latest.nickname}:</strong>
                      <span>{commentMeta.latest.text}</span>
                    </div>
                  )}

                  <div className="map-popup-actions">
                    <button
                      className="map-cta"
                      onClick={() => onOpenStatus?.(status)}
                    >
                      <Send size={15} strokeWidth={2.3} />
                      <span>פתח</span>
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
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