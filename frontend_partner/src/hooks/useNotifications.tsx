import { useEffect } from 'react';
import { useUserStore } from '../store/user.store';

const SYNC_INTERVAL = 5 * 60 * 1000;

export type UseNotificationsOptions = {
  forceSyncOnMount?: boolean;
};

export function useNotifications(options?: UseNotificationsOptions) {
  const forceSyncOnMount = options?.forceSyncOnMount ?? false;
  const user = useUserStore((s) => s.user);

  useEffect(() => {
    if (!user) return;
    const { syncUnreadNotifications, isNotifSyncStale } = useUserStore.getState();
    if (forceSyncOnMount) {
      void syncUnreadNotifications();
    } else if (isNotifSyncStale()) {
      void syncUnreadNotifications();
    }
  }, [user, forceSyncOnMount]);

  useEffect(() => {
    if (!user) return;
    const id = setInterval(() => {
      const { isNotifSyncStale, syncUnreadNotifications } = useUserStore.getState();
      if (isNotifSyncStale()) void syncUnreadNotifications();
    }, SYNC_INTERVAL);
    return () => clearInterval(id);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const onFocus = () => {
      const { isNotifSyncStale, syncUnreadNotifications } = useUserStore.getState();
      if (isNotifSyncStale(60_000)) void syncUnreadNotifications();
    };
    const onOnline = () => {
      void useUserStore.getState().syncUnreadNotifications();
    };
    window.addEventListener('focus', onFocus);
    window.addEventListener('online', onOnline);
    return () => {
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('online', onOnline);
    };
  }, [user]);

  const syncUnreadNotifications = useUserStore((s) => s.syncUnreadNotifications);

  return { sync: syncUnreadNotifications };
}
