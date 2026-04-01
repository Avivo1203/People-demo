import React, { useState } from "react";

export default function StatusForm({ onAddStatus }) {
  const [text, setText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    
    // שולח רק את הטקסט, סוג הסטטוס יהיה תמיד 'general' כברירת מחדל
    onAddStatus({ 
      text: text.trim(), 
      type: 'general',
      time: new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })
    });
    
    setText("");
  };

  return (
    <div className="status-composer-card">
      <form className="status-form-simple" onSubmit={handleSubmit}>
        <div className="status-form-field">
          <textarea
            className="status-textarea"
            placeholder="כתוב עדכון לקהילה שלך..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            style={{ minHeight: '80px' }} // גובה מוקטן למראה נקי יותר
          />
        </div>

        <div className="status-form-footer" style={{ justifyContent: 'flex-end' }}>
          <button 
            type="submit" 
            className="status-form-submit" 
            disabled={!text.trim()}
          >
            פרסם עדכון 🚀
          </button>
        </div>
      </form>
    </div>
  );
}