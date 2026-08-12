/**
 * Time formatting utilities
 */

/**
 * Returns a human-readable relative time string, e.g. "3 min ago", "just now"
 * @param {Date|import('firebase/firestore').Timestamp|number} timestamp
 */
export function timeAgo(timestamp) {
  if (!timestamp) return '—';

  let date;
  if (timestamp?.toDate) {
    // Firestore Timestamp
    date = timestamp.toDate();
  } else if (timestamp instanceof Date) {
    date = timestamp;
  } else {
    date = new Date(timestamp);
  }

  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 5) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

/**
 * Returns a formatted date string, e.g. "Aug 6, 2026 5:30 AM"
 * @param {Date|import('firebase/firestore').Timestamp|number} timestamp
 */
export function formatDate(timestamp) {
  if (!timestamp) return '—';

  let date;
  if (timestamp?.toDate) {
    date = timestamp.toDate();
  } else if (timestamp instanceof Date) {
    date = timestamp;
  } else {
    date = new Date(timestamp);
  }

  return date.toLocaleString('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Duration between two timestamps in minutes
 * @param {any} start
 * @param {any} end
 */
export function durationMinutes(start, end) {
  if (!start || !end) return null;
  const s = start?.toDate ? start.toDate() : new Date(start);
  const e = end?.toDate ? end.toDate() : new Date(end);
  return Math.round((e.getTime() - s.getTime()) / 60000);
}

/**
 * Format a duration in minutes as "Xh Ym" or "Ym"
 * @param {number|null} minutes
 */
export function formatDuration(minutes) {
  if (minutes === null || minutes === undefined) return '—';
  if (minutes < 1) return '< 1 min';
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

/**
 * Today's start as a Date object
 */
export function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}
