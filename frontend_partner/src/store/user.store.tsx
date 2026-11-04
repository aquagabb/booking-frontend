import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  getUnreadMessagesCount,
  getUnreadNotificationsCount,
} from '../api/notifications/notifications';
import { parseUnreadCountResponse } from '../utils/notificationResponses';
import { useAdminStore } from './admin.store';
import { clearOnboardingPointer } from '../pages/protected/admin/Locations/Onboarding/onboardingStorage';

/** Șterge datele legate de contul curent din celelalte store-uri / localStorage. */
const clearAccountScopedData = () => {
  useAdminStore.getState().clearOrganization();
  clearOnboardingPointer();
};

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
  hasHydrated: boolean;

  setUser: (user: User) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
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
      hasHydrated: false,

      setUser: (user) => {
        const previous = get().user;
        // Alt cont decât cel memorat (ex. sesiune expirată fără logout) → nu păstrăm datele vechi
        if (!previous || String(previous.id) !== String(user.id)) {
          clearAccountScopedData();
          set({
            unreadCount: 0,
            unreadMessageCount: 0,
            lastNotifSyncedAt: null,
            lastMessageSyncedAt: null,
          });
        }
        set({ user });
      },
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),

      clearUser: () => {
        clearAccountScopedData();
        set({
          user: null,
          unreadCount: 0,
          unreadMessageCount: 0,
          lastNotifSyncedAt: null,
          lastMessageSyncedAt: null,
        });
      },

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
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
