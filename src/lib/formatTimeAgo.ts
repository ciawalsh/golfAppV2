/**
 * Format a millisecond timestamp as a short time-ago string.
 * E.g. "2m", "1h", "3d", "2w", "3mo"
 */
export function formatTimeAgo(timestampMs: number): string {
  if (!timestampMs || !Number.isFinite(timestampMs)) return '';

  const now = Date.now();
  const diffMs = now - timestampMs;

  if (diffMs < 0 || diffMs < 60_000) return 'just now';

  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 60) return `${minutes}m`;

  const hours = Math.floor(diffMs / 3_600_000);
  if (hours < 24) return `${hours}h`;

  const days = Math.floor(diffMs / 86_400_000);
  if (days < 7) return `${days}d`;

  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo`;

  const years = Math.floor(days / 365);
  return `${years}y`;
}
