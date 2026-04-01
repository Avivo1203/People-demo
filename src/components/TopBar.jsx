import React from 'react';

export default function TopBar({ activeTab, onChangeTab, radius, setRadius }) {
  return (
    <div className="topbar-shell">
      <div className="topbar-stack">
        
        {/* שורת החיפוש המעוצבת */}
        <div className="searchbar-input-wrap">
          <div className="searchbar-icon">🔍</div>
          <input 
            type="text" 
            className="searchbar-input" 
            placeholder="חפש מיקום, אנשים או קהילות..." 
          />
          <button className="searchbar-clear-btn">✕</button>
        </div>

        {/* שורת הטאבים והרדיוס - מחולקת ל-2 עמודות לפי ה-CSS שלך */}
        <div className="navtabs-wrapper">
          
          {/* כרטיסיית הניווט (מפה/סטטוסים) */}
          <div className="navtabs-card">
            <div className="navtabs-inner">
              <div className={`navtabs-indicator ${activeTab === 'map' ? 'map-active' : 'status-active'}`} />
              
              <button 
                className={`navtab-btn ${activeTab === 'map' ? 'active' : ''}`}
                onClick={() => onChangeTab('map')}
              >
                <div className="navtab-text">
                  <span className="navtab-title">מפה</span>
                  <span className="navtab-subtitle">תצוגה חזותית</span>
                </div>
                <div className={`navtab-icon map-mode ${activeTab === 'map' ? 'active' : ''}`}>🗺️</div>
              </button>

              <button 
                className={`navtab-btn ${activeTab === 'statuses' ? 'active' : ''}`}
                onClick={() => onChangeTab('statuses')}
              >
                <div className="navtab-text">
                  <span className="navtab-title">סטטוסים</span>
                  <span className="navtab-subtitle">מה קורה עכשיו</span>
                </div>
                <div className={`navtab-icon status-mode ${activeTab === 'statuses' ? 'active' : ''}`}>💬</div>
              </button>
            </div>
          </div>

          {/* כרטיסיית הרדיוס המעוצבת */}
          <div className="radius-card">
            <div className="radius-top">
              <div className="radius-title-wrap">
                <div className="radius-icon">🎯</div>
                <div>
                  <div className="radius-title">רדיוס חיפוש</div>
                  <div className="radius-subtitle">מרחק מהמיקום שלך</div>
                </div>
              </div>
              <div className="radius-value">{radius} מ'</div>
            </div>
            
            <div className="radius-slider-wrap">
              <div className="radius-slider-glow"></div>
              <input 
                type="range" 
                className="radius-slider"
                min="100" 
                max="2000" 
                step="100"
                value={radius}
                onChange={(e) => setRadius(e.target.value)}
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}