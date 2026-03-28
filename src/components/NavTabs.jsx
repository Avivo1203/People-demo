import React, { useMemo } from "react";

export default function NavTabs({
  activeTab,
  onChangeTab,
  onHideTopBar,
  radius = 1500,
  onRadiusChange,
}) {
  const isMap = activeTab === "map";

  const radiusLabel = useMemo(() => {
    if (radius < 1000) return `${radius} מ׳`;
    const km = radius / 1000;
    return `${Number.isInteger(km) ? km : km.toFixed(1)} ק״מ`;
  }, [radius]);

  const shellStyle = {
    width: "min(1180px, calc(100% - 28px))",
    margin: "0 auto 18px auto",
    position: "relative",
    zIndex: 50,
    direction: "rtl",
  };

  const wrapperStyle = {
    position: "relative",
    display: "grid",
    gridTemplateColumns: "1.2fr 0.9fr",
    gap: "16px",
    alignItems: "stretch",
  };

  const glassCard = {
    position: "relative",
    overflow: "hidden",
    borderRadius: "32px",
    backdropFilter: "blur(22px)",
    WebkitBackdropFilter: "blur(22px)",
    background:
      "linear-gradient(135deg, rgba(255,255,255,0.74), rgba(255,255,255,0.50))",
    border: "1px solid rgba(255,255,255,0.55)",
    boxShadow:
      "0 14px 40px rgba(15,23,42,0.12), inset 0 1px 0 rgba(255,255,255,0.65)",
  };

  const navCardStyle = {
    ...glassCard,
    padding: "10px",
    minHeight: "112px",
  };

  const navInnerStyle = {
    position: "relative",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
    minHeight: "92px",
  };

  const indicatorStyle = {
    position: "absolute",
    top: "0",
    bottom: "0",
    width: "calc(50% - 5px)",
    borderRadius: "24px",
    background:
      isMap
        ? "linear-gradient(135deg, #0f4fff 0%, #2d7dff 55%, #79b8ff 100%)"
        : "linear-gradient(135deg, #7c3aed 0%, #a855f7 55%, #c084fc 100%)",
    boxShadow: isMap
      ? "0 12px 30px rgba(37,99,235,0.30), inset 0 1px 0 rgba(255,255,255,0.25)"
      : "0 12px 30px rgba(124,58,237,0.28), inset 0 1px 0 rgba(255,255,255,0.25)",
    transform: isMap ? "translateX(0)" : "translateX(calc(100% + 10px))",
    transition: "all 0.35s ease",
    zIndex: 0,
  };

  const tabButtonBase = (active) => ({
    position: "relative",
    zIndex: 1,
    border: "none",
    outline: "none",
    background: active ? "transparent" : "rgba(255,255,255,0.18)",
    color: active ? "#ffffff" : "#10203a",
    borderRadius: "24px",
    cursor: "pointer",
    padding: "18px 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "14px",
    textAlign: "right",
    transition: "all 0.25s ease",
    minHeight: "92px",
    boxShadow: active
      ? "none"
      : "inset 0 1px 0 rgba(255,255,255,0.45), 0 4px 14px rgba(15,23,42,0.05)",
  });

  const tabTextWrap = {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
    alignItems: "flex-start",
    flex: 1,
  };

  const tabTitle = {
    fontSize: "18px",
    fontWeight: 800,
    letterSpacing: "0.2px",
    lineHeight: 1.1,
  };

  const tabSub = (active) => ({
    fontSize: "12px",
    fontWeight: 600,
    opacity: active ? 0.92 : 0.72,
    lineHeight: 1.2,
  });

  const iconBubble = (active, mode) => ({
    width: "52px",
    height: "52px",
    minWidth: "52px",
    borderRadius: "18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "23px",
    background: active
      ? "rgba(255,255,255,0.18)"
      : mode === "map"
      ? "linear-gradient(135deg, rgba(59,130,246,0.14), rgba(96,165,250,0.22))"
      : "linear-gradient(135deg, rgba(168,85,247,0.14), rgba(192,132,252,0.22))",
    boxShadow: active
      ? "inset 0 1px 0 rgba(255,255,255,0.25)"
      : "0 8px 18px rgba(15,23,42,0.06)",
    border: active ? "1px solid rgba(255,255,255,0.18)" : "1px solid rgba(255,255,255,0.4)",
  });

  const radiusCardStyle = {
    ...glassCard,
    padding: "16px 18px",
    minHeight: "112px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  };

  const radiusTopStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    marginBottom: "14px",
  };

  const radiusTitleWrap = {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  };

  const radiusIconStyle = {
    width: "42px",
    height: "42px",
    borderRadius: "15px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    background: "linear-gradient(135deg, rgba(14,165,233,0.18), rgba(59,130,246,0.22))",
    color: "#0f4fff",
    boxShadow: "0 8px 18px rgba(37,99,235,0.12)",
  };

  const radiusTitleStyle = {
    fontSize: "15px",
    fontWeight: 800,
    color: "#0f172a",
    lineHeight: 1.1,
  };

  const radiusSubStyle = {
    fontSize: "12px",
    color: "rgba(51,65,85,0.78)",
    fontWeight: 600,
    marginTop: "4px",
  };

  const radiusValueStyle = {
    padding: "10px 15px",
    borderRadius: "999px",
    fontSize: "14px",
    fontWeight: 900,
    color: "#0f4fff",
    background:
      "linear-gradient(135deg, rgba(59,130,246,0.12), rgba(125,211,252,0.22))",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.55)",
    whiteSpace: "nowrap",
  };

  const sliderWrapStyle = {
    position: "relative",
    padding: "4px 0 0 0",
  };

  const sliderTrackGlow = {
    position: "absolute",
    top: "50%",
    left: 0,
    right: 0,
    height: "14px",
    transform: "translateY(-50%)",
    borderRadius: "999px",
    background:
      "linear-gradient(90deg, rgba(125,211,252,0.28), rgba(59,130,246,0.38), rgba(124,58,237,0.30))",
    filter: "blur(10px)",
    pointerEvents: "none",
  };

  const sliderStyle = {
    width: "100%",
    appearance: "none",
    WebkitAppearance: "none",
    height: "10px",
    borderRadius: "999px",
    outline: "none",
    cursor: "pointer",
    position: "relative",
    background:
      "linear-gradient(90deg, #bae6fd 0%, #60a5fa 50%, #7c3aed 100%)",
    boxShadow: "inset 0 2px 6px rgba(15,23,42,0.12)",
  };

  const marksStyle = {
    marginTop: "10px",
    display: "flex",
    justifyContent: "space-between",
    fontSize: "11px",
    fontWeight: 700,
    color: "rgba(71,85,105,0.82)",
  };

  const hideBtnStyle = {
    position: "absolute",
    top: "-10px",
    left: "-10px",
    width: "42px",
    height: "42px",
    borderRadius: "16px",
    border: "1px solid rgba(255,255,255,0.65)",
    background: "linear-gradient(135deg, rgba(255,255,255,0.92), rgba(241,245,249,0.88))",
    boxShadow: "0 12px 22px rgba(15,23,42,0.16)",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: 900,
    color: "#334155",
    zIndex: 20,
  };

  const glowBgOne = {
    position: "absolute",
    width: "180px",
    height: "180px",
    borderRadius: "50%",
    background: "rgba(59,130,246,0.18)",
    top: "-70px",
    right: "-40px",
    filter: "blur(40px)",
    pointerEvents: "none",
  };

  const glowBgTwo = {
    position: "absolute",
    width: "160px",
    height: "160px",
    borderRadius: "50%",
    background: "rgba(168,85,247,0.16)",
    bottom: "-80px",
    left: "10%",
    filter: "blur(42px)",
    pointerEvents: "none",
  };

  return (
    <>
      <div style={shellStyle}>
        <div style={wrapperStyle}>
          <div style={navCardStyle}>
            <div style={glowBgOne} />
            <div style={glowBgTwo} />

            <div style={navInnerStyle} role="tablist" aria-label="Main sections">
              <span style={indicatorStyle} aria-hidden="true" />

              <button
                type="button"
                role="tab"
                aria-selected={isMap}
                onClick={() => onChangeTab("map")}
                style={tabButtonBase(isMap)}
              >
                <div style={tabTextWrap}>
                  <span style={tabTitle}>Map</span>
                  <span style={tabSub(isMap)}>מפה חיה, מיקומים ואנשים סביבך</span>
                </div>

                <div style={iconBubble(isMap, "map")}>🗺️</div>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={!isMap}
                onClick={() => onChangeTab("status")}
                style={tabButtonBase(!isMap)}
              >
                <div style={tabTextWrap}>
                  <span style={tabTitle}>Status Area</span>
                  <span style={tabSub(!isMap)}>פיד אזורי, סטטוסים, סטורי וצ׳אט</span>
                </div>

                <div style={iconBubble(!isMap, "status")}>✨</div>
              </button>
            </div>
          </div>

          <div style={radiusCardStyle}>
            <div style={glowBgOne} />
            <div
              style={{
                ...glowBgTwo,
                left: "auto",
                right: "5%",
                bottom: "-90px",
              }}
            />

            <div style={radiusTopStyle}>
              <div style={radiusTitleWrap}>
                <div style={radiusIconStyle}>📍</div>
                <div>
                  <div style={radiusTitleStyle}>רדיוס חיפוש חכם</div>
                  <div style={radiusSubStyle}>בחר כמה רחוק להציג אנשים, סטטוסים ותוכן</div>
                </div>
              </div>

              <div style={radiusValueStyle}>{radiusLabel}</div>
            </div>

            <div style={sliderWrapStyle}>
              <div style={sliderTrackGlow} />
              <input
                type="range"
                min="200"
                max="5000"
                step="100"
                value={radius}
                onChange={(e) => onRadiusChange?.(Number(e.target.value))}
                aria-label="בחירת רדיוס"
                style={sliderStyle}
              />
            </div>

            <div style={marksStyle}>
              <span>200 מ׳</span>
              <span>1 ק״מ</span>
              <span>2.5 ק״מ</span>
              <span>5 ק״מ</span>
            </div>
          </div>

          {activeTab === "status" && onHideTopBar && (
            <button
              type="button"
              onClick={onHideTopBar}
              title="הסתר סרגל"
              aria-label="הסתר סרגל עליון"
              style={hideBtnStyle}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <style>{`
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #ffffff;
          border: 4px solid #2563eb;
          box-shadow: 0 6px 18px rgba(37,99,235,0.28);
          cursor: pointer;
          transition: transform 0.2s ease;
        }

        input[type="range"]::-webkit-slider-thumb:hover {
          transform: scale(1.08);
        }

        input[type="range"]::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #ffffff;
          border: 4px solid #2563eb;
          box-shadow: 0 6px 18px rgba(37,99,235,0.28);
          cursor: pointer;
          transition: transform 0.2s ease;
        }

        @media (max-width: 980px) {
          .__dummy__ {}
        }

        @media (max-width: 980px) {
          div[style*="grid-template-columns: 1.2fr 0.9fr"] {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 640px) {
          div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }

          button[role="tab"] {
            min-height: 78px !important;
            padding: 16px !important;
          }
        }
      `}</style>
    </>
  );
}