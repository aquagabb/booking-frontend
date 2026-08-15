import { create } from 'zustand';
import {
  getClientNotifications,
  getClientNotificationsCount,
  markAllClientNotificationsAsRead,
} from '../api/notifications/notifications';
import { useUserStore } from './user.store';
import type { ClientNotification } from '../api/notifications/types';
import {
  parseNotificationsCountResponse,
  parseNotificationsListResponse,
} from '../utils/notificationResponses';

const SYNC_INTERVAL = 5 * 60 * 1000;
const DEFAULT_PAGE_SIZE = 50;

export type SyncNotificationsOptions = {
  append?: boolean;
};

interface NotificationsState {
  items: ClientNotification[];
  totalCount: number;
  lastFetchedBatchSize: number;
  syncing: boolean;
  markingAllRead: boolean;
  lastFetchedAt: number | null;

  syncFromBackend: (
    page?: number,
    size?: number,
    options?: SyncNotificationsOptions
  ) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  isStale: (ttl?: number) => boolean;
}

export const useNotificationsStore = create<NotificationsState>()((set, get) => ({
  items: [],
  totalCount: 0,
  lastFetchedBatchSize: 0,
  syncing: false,
  markingAllRead: false,
  lastFetchedAt: null,

  isStale: (ttl = SYNC_INTERVAL) => {
    const { lastFetchedAt } = get();
    if (!lastFetchedAt) return true;
    return Date.now() - lastFetchedAt > ttl;
  },

  syncFromBackend: async (
    page = 1,
    size = DEFAULT_PAGE_SIZE,
    options?: SyncNotificationsOptions
  ) => {
    set({ syncing: true });
    try {
      const [listRes, countRes] = await Promise.all([
        getClientNotifications(page, size),
        getClientNotificationsCount(),
      ]);

      let newItems: ClientNotification[] = [];
      if (listRes.status === 200) {
        newItems = parseNotificationsListResponse(listRes.response);
      }

      let totalCount = 0;
      if (countRes.status === 200) {
        totalCount = parseNotificationsCountResponse(countRes.response);
      }

      set((state) => {
        let items = newItems;
        if (options?.append) {
          const seen = new Set(state.items.map((n) => n.id));
          const merged = [...state.items];
          for (const n of newItems) {
            if (!seen.has(n.id)) {
              seen.add(n.id);
              merged.push(n);
            }
          }
          items = merged;
        }
        return {
          items,
          totalCount,
          lastFetchedBatchSize: newItems.length,
          lastFetchedAt: Date.now(),
        };
      });
    } finally {
      set({ syncing: false });
    }
  },

  markAllAsRead: async () => {
    const { items } = get();
    if (items.length === 0 || !items.some((n) => !n.isRead)) return;

    const previous = items;
    set({
      markingAllRead: true,
      items: items.map((n) => ({ ...n, isRead: true })),
    });

    try {
      const res = await markAllClientNotificationsAsRead();
      if (res.status !== 200) {
        set({ items: previous });
        return;
      }
      await useUserStore.getState().syncUnreadNotifications();
    } catch {
      set({ items: previous });
      await get().syncFromBackend();
    } finally {
      set({ markingAllRead: false });
    }
  },
}));
