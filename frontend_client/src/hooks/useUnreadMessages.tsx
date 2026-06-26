import { useEffect } from 'react';
import { useUserStore } from '../store/user.store';

const SYNC_INTERVAL = 5 * 60 * 1000;

export type UseUnreadMessagesOptions = {
  /** When true, always refetch from API on mount (e.g. messages screen). */
  forceSyncOnMount?: boolean;
};

export function useUnreadMessages(options?: UseUnreadMessagesOptions) {
  const forceSyncOnMount = options?.forceSyncOnMount ?? false;
  const user = useUserStore((s) => s.user);

  useEffect(() => {
    if (!user) return;
    const { syncUnreadMessages, isMessageSyncStale } = useUserStore.getState();
    if (forceSyncOnMount) {
      void syncUnreadMessages();
    } else if (isMessageSyncStale()) {
      void syncUnreadMessages();
    }
  }, [user, forceSyncOnMount]);

  useEffect(() => {
    if (!user) return;
    const id = setInterval(() => {
      const { isMessageSyncStale, syncUnreadMessages } = useUserStore.getState();
      if (isMessageSyncStale()) void syncUnreadMessages();
    }, SYNC_INTERVAL);
    return () => clearInterval(id);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const onFocus = () => {
      const { isMessageSyncStale, syncUnreadMessages } = useUserStore.getState();
      if (isMessageSyncStale(60_000)) void syncUnreadMessages();
    };
    const onOnline = () => {
      void useUserStore.getState().syncUnreadMessages();
    };
    window.addEventListener('focus', onFocus);
    window.addEventListener('online', onOnline);
    return () => {
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('online', onOnline);
    };
  }, [user]);

  const syncUnreadMessages = useUserStore((s) => s.syncUnreadMessages);

  return { sync: syncUnreadMessages };
}
