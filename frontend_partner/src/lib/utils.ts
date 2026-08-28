import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function toSelectOptions<T extends { id: number | string; name: string }>(
  data: T[] = []
) {
  return data.map((item) => ({
    value: item.id,
    label: item.name,
  }));
}

export function toLocationSelectOptions(
  data: Array<{ id: number | string; label: string; [key: string]: any }> = []
) {
  return data.map((item) => ({
    value: item.id,
    label: item.label,
  }));
}

export function formatDate(date: string | Date): string {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  };
  return new Date(date).toLocaleString('en-US', options);
}

const ROMANIAN_DAYS = ['Duminică', 'Luni', 'Marți', 'Miercuri', 'Joi', 'Vineri', 'Sâmbătă'];
const ROMANIAN_MONTHS = [
  'ianuarie', 'februarie', 'martie', 'aprilie', 'mai', 'iunie',
  'iulie', 'august', 'septembrie', 'octombrie', 'noiembrie', 'decembrie',
];

export function formatDateRomanian(date: string | Date, withTime = false): string {
  const d = new Date(date);
  const dayName = ROMANIAN_DAYS[d.getDay()];
  const day = d.getDate();
  const month = ROMANIAN_MONTHS[d.getMonth()];
  const year = d.getFullYear();
  const base = `${dayName}, ${day} ${month}, ${year}`;

  if (!withTime) return base;

  const time = d.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' });
  return `${base}, ${time}`;
}

export function formatRelativeTime(date: string | Date): { relative: string; full: string } {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  const fullDate = formatDate(date);

  // If more than 7 days, return normal date format
  if (diffDays > 7) {
    return {
      relative: fullDate,
      full: fullDate,
    };
  }

  // Format relative time in Romanian
  if (diffDays > 0) {
    return {
      relative: `acum ${diffDays} ${diffDays === 1 ? 'zi' : 'zile'}`,
      full: fullDate,
    };
  }

  if (diffHours > 0) {
    return {
      relative: `acum ${diffHours}h`,
      full: fullDate,
    };
  }

  if (diffMinutes > 0) {
    return {
      relative: `acum ${diffMinutes}min`,
      full: fullDate,
    };
  }

  return {
    relative: 'acum',
    full: fullDate,
  };
}


const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Remaining time until expiry, for copy like "2 zile 22h", "17h", "25 min" (Romanian admin UI). */
export function formatRespondWithinShort(ms: number): string {
  if (ms <= 0) return '';
  const totalMinutes = Math.floor(ms / (1000 * 60));
  const totalHours = Math.floor(totalMinutes / 60);

  if (totalHours >= 24) {
    const days = Math.floor(totalHours / 24);
    const remainingHours = totalHours % 24;
    const daysLabel = `${days} ${days === 1 ? 'zi' : 'zile'}`;
    return remainingHours > 0 ? `${daysLabel} ${remainingHours}h` : daysLabel;
  }
  if (totalHours > 0) {
    const minutes = totalMinutes % 60;
    return minutes > 0 ? `${totalHours}h ${minutes}m` : `${totalHours}h`;
  }
  return `${Math.max(1, totalMinutes)} min`;
}

const MAX_RESPONSE_WINDOW_MS = 3 * MS_PER_DAY;

/** True when expiresAt is in the future and within the app's max response window (3 days). */
export function getPendingExpiryUrgency(expiresAt: string | undefined): {
  show: boolean;
  label: string;
} {
  if (!expiresAt) return { show: false, label: '' };
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (ms <= 0 || ms > MAX_RESPONSE_WINDOW_MS) return { show: false, label: '' };
  return { show: true, label: formatRespondWithinShort(ms) };
}

export function formatDuration(checkIn?: string, checkOut?: string): string | null {
  if (!checkIn || !checkOut) return null;
  const diffMs = new Date(checkOut).getTime() - new Date(checkIn).getTime();
  if (diffMs <= 0) return null;

  const days = Math.floor(diffMs / MS_PER_DAY);
  const hours = Math.floor((diffMs % MS_PER_DAY) / (60 * 60 * 1000));
  const minutes = Math.floor((diffMs % (60 * 60 * 1000)) / (60 * 1000));

  if (days > 0) {
    const daysLabel = `${days} ${days === 1 ? 'zi' : 'zile'}`;
    return hours > 0 ? `${daysLabel} ${hours}h` : daysLabel;
  }
  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
  return `${minutes} min`;
}

export function getInitials(name?: string): string {
  if (!name) return '??';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}



