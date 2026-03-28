import React, { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// קפיצה למיקום חדש במפה
function FlyTo({ center, zoom = 14 }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, zoom, { duration: 0.9 });
  }, [center, zoom, map]);
  return null;
}

export default function RealMap({ statuses = [], onOpenChat, userLocation }) {
  const defaultCenter = useMemo(() => ({ lat: 32.0853, lng: 34.7818 }), []);
  const [center, setCenter] = useState(defaultCenter);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [radius, setRadius] = useState(1500);
  const [nearby, setNearby] = useState([]);
  const popupRef = useRef(null);

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
        html: `<div class="person-dot">👤</div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      }),
    []
  );

  useEffect(() => {
    if (userLocation?.latitude && userLocation?.longitude) {
      const p = { lat: userLocation.latitude, lng: userLocation.longitude };
      setSelectedPoint(p);
      setCenter(p);
      setNearby([]);
    }
  }, [userLocation]);

  const haversineMeters = (a, b) => {
    const toRad = (d) => (d * Math.PI) / 180;
    const R = 6371000;
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);
    const x =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
    return R * c;
  };

  const handleFindPeople = () => {
    if (!selectedPoint) return;
    const results = statuses
      .filter((s) => s?.location && typeof s.location.lat === "number" && typeof s.location.lng === "number")
      .map((s) => {
        const dist = haversineMeters(selectedPoint, {
          lat: s.location.lat,
          lng: s.location.lng,
        });
        return { ...s, _distanceM: dist };
      })
      .filter((s) => s._distanceM <= radius)
      .sort((a, b) => a._distanceM - b._distanceM);

    setNearby(results);
  };

  const clearSelection = () => {
    setSelectedPoint(null);
    setNearby([]);
    setCenter(defaultCenter);
  };

  return (
    <div style={{ height: "100vh", position: "relative" }}>
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <FlyTo center={center} zoom={14} />

        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        {selectedPoint && (
          <>
            <Marker
              position={selectedPoint}
              icon={pulseIcon}
              eventHandlers={{
                click: () => popupRef.current?.openOn(popupRef.current._map),
              }}
            >
              <Popup ref={popupRef}>
                <div style={{ display: "grid", gap: 8 }}>
                  <strong>📍 מיקום נבחר</strong>
                  <span style={{ fontSize: 12 }}>
                    lat {selectedPoint.lat.toFixed(5)}, lng {selectedPoint.lng.toFixed(5)}
                  </span>

                  <label>
                    רדיוס חיפוש (מ'):
                    <input
                      type="range"
                      min={200}
                      max={5000}
                      step={100}
                      value={radius}
                      onChange={(e) => setRadius(Number(e.target.value))}
                      style={{ width: "100%" }}
                    />
                  </label>
                  <div style={{ fontSize: 13 }}>{radius.toLocaleString()} מטר</div>

                  <button className="map-cta" onClick={handleFindPeople}>
                    🔍 חפש אנשים קרובים
                  </button>
                </div>
              </Popup>
            </Marker>

            <Circle center={selectedPoint} radius={radius} pathOptions={{ color: "#0ea5e9", fillOpacity: 0.08 }} />
          </>
        )}

        {nearby.map((s) => (
          <Marker
            key={s.id || `${s.nickname}-${s.timestamp}`}
            position={[s.location.lat, s.location.lng]}
            icon={personIcon}
          >
            <Popup>
              <div style={{ display: "grid", gap: 6 }}>
                <strong>{s.nickname || "משתמש"}</strong>
                <div>{s.text || "—"}</div>
                <div style={{ fontSize: 12 }}>
                  מרחק: {(s._distanceM / 1000).toFixed(2)} ק"מ
                </div>
                <button
                  className="map-cta"
                  onClick={() => onOpenChat?.(s.nickname || "משתמש")}
                >
                  💬 צ׳אט
                </button>
              </div>
            </Popup>
          </Marker>
        ))}

        {nearby.length === 0 &&
          statuses.map((s) =>
            s?.location ? (
              <Marker
                key={`all-${s.id || `${s.nickname}-${s.timestamp}`}`}
                position={[s.location.lat, s.location.lng]}
                icon={personIcon}
              >
                <Popup>
                  <div style={{ display: "grid", gap: 6 }}>
                    <strong>{s.nickname || "משתמש"}</strong>
                    <div>{s.text || "—"}</div>
                    <button
                      className="map-cta"
                      onClick={() => onOpenChat?.(s.nickname || "משתמש")}
                    >
                      💬 צ׳אט
                    </button>
                  </div>
                </Popup>
              </Marker>
            ) : null
          )}
      </MapContainer>

      {/* לחצני פעולה צפים */}
      <div className="map-fab-panel">
        {selectedPoint ? (
          <>
            <button className="map-fab" onClick={handleFindPeople}>
              🔍 חפש אנשים
            </button>
            <button className="map-fab" onClick={clearSelection}>
              ❌ נקה
            </button>
          </>
        ) : (
          <div className="map-hint">בחר מיקום בחיפוש למעלה…</div>
        )}
      </div>
    </div>
  );
}
