/* eslint-disable @typescript-eslint/no-explicit-any */
export function formatUploadDateTime(dateString: string) {
  if (!dateString) return 'Unknown';

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Invalid date';

  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatFileSize(bytes: number) {
  if (!bytes || bytes <= 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

export const formatUploadDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60)
    return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  if (diffHours < 24)
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  if (diffDays < 30)
    return `${Math.floor(diffDays / 7)} week${
      Math.floor(diffDays / 7) !== 1 ? 's' : ''
    } ago`;
  return date.toLocaleDateString();
};

export const safeDate = (value: any) => {
  if (!value) return '—';
  const d = new Date(value);
  return isNaN(d.getTime()) ? '—' : d.toLocaleString();
};

export const safeTime = (v: any) => (v ? new Date(v).getTime() : 0);
