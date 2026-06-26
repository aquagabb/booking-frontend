import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  getUnreadMessagesCount,
  getUnreadNotificationsCount,
} from '../api/notifications/notifications';
import { parseUnreadCountResponse } from '../utils/notificationResponses';

const SYNC_INTERVAL = 5 * 60 * 1000;

export interface Preferences {
  theme?: 'light' | 'dark';
  language?: string;
  sidebarState?: 'open' | 'collapsed';
  emailNotifications?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: 'user' | 'owner' | 'admin';
  token?: string;
  preferences?: Preferences;
}

interface UserState {
  user: User | null;
  unreadCount: number;
  unreadMessageCount: number;
  lastNotifSyncedAt: number | null;
  lastMessageSyncedAt: number | null;

  setUser: (user: User) => void;
  clearUser: () => void;
  updatePreferences: (preferences: Preferences) => void;

  syncUnreadNotifications: () => Promise<void>;
  syncUnreadMessages: () => Promise<void>;
  isNotifSyncStale: (ttl?: number) => boolean;
  isMessageSyncStale: (ttl?: number) => boolean;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      unreadCount: 0,
      unreadMessageCount: 0,
      lastNotifSyncedAt: null,
      lastMessageSyncedAt: null,

      setUser: (user) => set({ user }),

      clearUser: () =>
        set({
          user: null,
          unreadCount: 0,
          unreadMessageCount: 0,
          lastNotifSyncedAt: null,
          lastMessageSyncedAt: null,
        }),

      updatePreferences: (preferences) =>
        set((state) => {
          if (!state.user) return state;
          return {
            user: {
              ...state.user,
              preferences: {
                ...state.user.preferences,
                ...preferences,
              },
            },
          };
        }),

      isNotifSyncStale: (ttl = SYNC_INTERVAL) => {
        const { lastNotifSyncedAt } = get();
        if (!lastNotifSyncedAt) return true;
        return Date.now() - lastNotifSyncedAt > ttl;
      },

      isMessageSyncStale: (ttl = SYNC_INTERVAL) => {
        const { lastMessageSyncedAt } = get();
        if (!lastMessageSyncedAt) return true;
        return Date.now() - lastMessageSyncedAt > ttl;
      },

      syncUnreadNotifications: async () => {
        if (!get().user) return;
        try {
          const { status, response } = await getUnreadNotificationsCount();
          if (status === 200) {
            set({
              unreadCount: parseUnreadCountResponse(response),
              lastNotifSyncedAt: Date.now(),
            });
          }
        } catch {
          /* ignore */
        }
      },

      syncUnreadMessages: async () => {
        if (!get().user) return;
        try {
          const { status, response } = await getUnreadMessagesCount();
          if (status === 200) {
            set({
              unreadMessageCount: parseUnreadCountResponse(response),
              lastMessageSyncedAt: Date.now(),
            });
          }
        } catch {
          /* ignore */
        }
      },
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({
        user: state.user,
        unreadCount: state.unreadCount,
        unreadMessageCount: state.unreadMessageCount,
        lastNotifSyncedAt: state.lastNotifSyncedAt,
        lastMessageSyncedAt: state.lastMessageSyncedAt,
      }),
    }
  )
);
