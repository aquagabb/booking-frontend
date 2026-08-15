import type { ClientNotification } from '../api/notifications/types';

function pickCount(raw: unknown): number {
  if (raw == null || typeof raw !== 'object') return 0;
  const o = raw as Record<string, unknown>;
  const c = o.count ?? (o.data as Record<string, unknown> | undefined)?.count;
  return typeof c === 'number' && Number.isFinite(c)
    ? Math.max(0, Math.floor(c))
    : 0;
}

export function parseUnreadCountResponse(response: unknown): number {
  return pickCount(response);
}

export function parseNotificationsListResponse(
  raw: unknown
): ClientNotification[] {
  if (Array.isArray(raw)) {
    return raw as ClientNotification[];
  }
  if (raw != null && typeof raw === 'object') {
    const o = raw as Record<string, unknown>;
    const nested =
      o.data ??
      o.content ??
      o.notifications ??
      (Array.isArray(o.items) ? o.items : undefined);
    if (Array.isArray(nested)) {
      return nested as ClientNotification[];
    }
  }
  return [];
}

export function parseNotificationsCountResponse(raw: unknown): number {
  if (raw == null || typeof raw !== 'object') return 0;
  const o = raw as Record<string, unknown>;
  const c =
    o.count ??
    o.total ??
    (o.data as Record<string, unknown> | undefined)?.count ??
    (typeof o.data === 'number' ? o.data : undefined);
  if (typeof c === 'number' && Number.isFinite(c)) {
    return Math.max(0, Math.floor(c));
  }
  return 0;
}
