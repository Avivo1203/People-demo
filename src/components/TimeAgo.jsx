import { useEffect, useState } from 'react';

function formatTimeAgo(timestamp) {
  const now = new Date();
  const date = new Date(timestamp);
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return 'הרגע';
  if (diff < 3600) return `${Math.floor(diff / 60)} דק׳`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ש׳`;
  return date.toLocaleDateString('he-IL');
}

export default function TimeAgo({ timestamp }) {
  const [timeAgo, setTimeAgo] = useState(formatTimeAgo(timestamp));

  useEffect(() => {
    const interval = setInterval(() => setTimeAgo(formatTimeAgo(timestamp)), 60000);
    return () => clearInterval(interval);
  }, [timestamp]);

  return <span className="timestamp">{timeAgo}</span>;
}
