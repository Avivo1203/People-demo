import React from 'react';
import StatusForm from './StatusForm';
import StatusFeed from './StatusFeed';

export default function StatusArea({ statuses, onAddStatus, ...props }) {
  return (
    <main className="status-fullscreen">
      <div className="status-area-shell">
        
        <header className="status-area-hero">
          <div className="status-area-hero-text">
            <span className="status-area-eyebrow">LIVE UPDATES</span>
            <h2>מה קורה עכשיו?</h2>
            <p>כל העדכונים, האירועים והבקשות לעזרה ברדיוס שנבחר.</p>
          </div>
          
          <div className="status-area-stats">
            <div className="status-stat-box">
              <strong>{statuses.length}</strong>
              <span>סטטוסים פעילים</span>
            </div>
            {/* אפשר להוסיף עוד ריבועי סטטיסטיקה כאן */}
          </div>
        </header>

        <StatusForm onAddStatus={onAddStatus} />

        <div className="status-tab-content">
          <StatusFeed statuses={statuses} {...props} />
        </div>
        
      </div>
    </main>
  );
}