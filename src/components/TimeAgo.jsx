import React from "react";

export default function TimeAgo({ timestamp }) {
  if (!timestamp) {
    return <span>עכשיו</span>;
  }

  const date = new Date(timestamp);
  const diffMs = Date.now() - date.getTime();

  if (Number.isNaN(diffMs) || diffMs < 0) {
    return <span>עכשיו</span>;
  }

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 30) {
    return <span>עכשיו</span>;
  }

  if (seconds < 60) {
    return <span>לפני פחות מדקה</span>;
  }

  if (minutes < 60) {
    return <span>לפני {minutes} דקות</span>;
  }

  if (hours < 24) {
    return <span>לפני {hours} שעות</span>;
  }

  if (days === 1) {
    return <span>אתמול</span>;
  }

  if (days < 7) {
    return <span>לפני {days} ימים</span>;
  }

  return (
    <span>
      {date.toLocaleDateString("he-IL", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })}
    </span>
  );
}