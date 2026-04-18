import { useEffect } from 'react';
import { useUserStore } from '../../../../../store/user.store';
import { useNotificationsStore } from '../../../../../store/notifications.store';

const SYNC_INTERVAL = 5 * 60 * 1000;
const DEFAULT_INITIAL_PAGE_SIZE = 50;

export type UseNotificationOptions = {
  /** When true, always refetch from API on mount (e.g. notifications screen). */
  forceSyncOnMount?: boolean;
  /** First-page size for the initial sync (e.g. 5 on the notifications page). */
  initialPageSize?: number;
};

function refreshListWindow(pageSizeFloor: number) {
  const { syncFromBackend, items } = useNotificationsStore.getState();
  const size = Math.max(pageSizeFloor, items.length);
  void syncFromBackend(1, size);
}

export function useNotification(options?: UseNotificationOptions) {
  const forceSyncOnMount = options?.forceSyncOnMount ?? false;
  const initialPageSize =
    options?.initialPageSize ?? DEFAULT_INITIAL_PAGE_SIZE;
  const user = useUserStore((s) => s.user);
  const store = useNotificationsStore();

  useEffect(() => {
    if (!user) return;
    const { syncFromBackend, isStale } = useNotificationsStore.getState();
    if (forceSyncOnMount) {
      void syncFromBackend(1, initialPageSize);
    } else if (isStale()) {
      void syncFromBackend(1, initialPageSize);
    }
  }, [user, forceSyncOnMount, initialPageSize]);

  useEffect(() => {
    if (!user) return;
    const id = setInterval(() => {
      const { isStale } = useNotificationsStore.getState();
      if (isStale()) refreshListWindow(initialPageSize);
    }, SYNC_INTERVAL);
    return () => clearInterval(id);
  }, [user, initialPageSize]);

  useEffect(() => {
    if (!user) return;
    const onFocus = () => {
      const { isStale } = useNotificationsStore.getState();
      if (isStale(60_000)) refreshListWindow(initialPageSize);
    };
    const onOnline = () => {
      refreshListWindow(initialPageSize);
    };
    window.addEventListener('focus', onFocus);
    window.addEventListener('online', onOnline);
    return () => {
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('online', onOnline);
    };
  }, [user]);

  return store;
}
