/**
 * Formats duration in milliseconds to mm:ss format
 */
export function formatDurationMmSs(durationMs: number): string {
  const totalSeconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Formats timestamp to readable time string
 */
export function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString();
}

/**
 * Gets current timestamp
 */
export function getCurrentTimestamp(): number {
  return Date.now();
}
