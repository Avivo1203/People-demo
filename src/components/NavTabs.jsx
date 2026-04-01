import React from 'react';

export default function NavTabs({ geoRadius, setGeoRadius, activeTab, setActiveTab }) {
  return (
    <div className="navtabs-shell">
      <div className="navtabs-wrapper">
        
        {/* כפתורי המעבר בין מפה לפיד */}
        <div className="navtabs-card">
          <div className="navtabs-inner">
            <div className={`navtabs-indicator ${activeTab}-active`}></div>
            <button 
              className={`navtab-btn ${activeTab === 'map' ? 'active' : ''}`}
              onClick={() => setActiveTab('map')}
            >
              <span className="navtab-title">מפה</span>
            </button>
            <button 
              className={`navtab-btn ${activeTab === 'status' ? 'active' : ''}`}
              onClick={() => setActiveTab('status')}
            >
              <span className="navtab-title">סטטוסים</span>
            </button>
          </div>
        </div>

        {/* כרטיסיית הרדיוס */}
        <div className="radius-card">
          <div className="radius-top">
            <div className="radius-title-wrap">
              <span className="radius-title">רדיוס חיפוש</span>
            </div>
            <span className="radius-value">{geoRadius} מ'</span>
          </div>
          <div className="radius-slider-wrap">
            <input 
              type="range" 
              className="radius-slider"
              min="500" 
              max="5000" 
              step="100"
              value={geoRadius}
              onChange={(e) => setGeoRadius(parseInt(e.target.value))}
            />
          </div>
        </div>

      </div>
    </div>
  );
}