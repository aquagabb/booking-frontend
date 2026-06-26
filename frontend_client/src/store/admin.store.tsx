import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Preferences {
  theme?: 'light' | 'dark';
  language?: string;
  sidebarState?: 'open' | 'collapsed';
  emailNotifications?: boolean;
}

export interface Organization {
  id: string;
  companyName: string;
  email: string;
  phone?: string;
  address?: string;
  taxId?: string;
  registrationNumber?: string;
  website?: string;
  logo?: string;
  role?: 'owner' | 'admin';
  token?: string;
  preferences?: Preferences;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminMetrics {
  totalProperties: number;
  pendingBookings: number;
  upcomingBookings: number;
  unreadMessages: number;
  expiringHolds: number;
  lastUpdated?: string;
}

interface AdminState {
  organization: Organization | null;
  metrics: AdminMetrics;
  isLoadingMetrics: boolean;
  setOrganization: (organization: Organization) => void;
  clearOrganization: () => void;
  updatePreferences: (preferences: Preferences) => void;
  setMetrics: (metrics: AdminMetrics) => void;
  updateMetrics: (updates: Partial<AdminMetrics>) => void;
  fetchMetrics: () => Promise<void>;
}

const initialMetrics: AdminMetrics = {
  totalProperties: 0,
  pendingBookings: 0,
  upcomingBookings: 0,
  unreadMessages: 0,
  expiringHolds: 0,
};

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      organization: null,
      metrics: initialMetrics,
      isLoadingMetrics: false,

      setOrganization: (organization) => set({ organization }),

      clearOrganization: () => set({ organization: null, metrics: initialMetrics }),

      updatePreferences: (preferences) =>
        set((state) => {
          if (!state.organization) return state;
          return {
            organization: {
              ...state.organization,
              preferences: {
                ...state.organization.preferences,
                ...preferences,
              },
            },
          };
        }),

      setMetrics: (metrics) => 
        set({ 
          metrics: {
            ...metrics,
            lastUpdated: new Date().toISOString(),
          },
        }),

      updateMetrics: (updates) =>
        set((state) => ({
          metrics: {
            ...state.metrics,
            ...updates,
            lastUpdated: new Date().toISOString(),
          },
        })),

      fetchMetrics: async () => {
        set({ isLoadingMetrics: true });
        try {
          const { getAdminMetrics } = await import('../api/others/others');
          const { status, response } = await getAdminMetrics();
          if (status === 200 && response) {
            get().setMetrics({
              totalProperties: response.totalProperties || 0,
              pendingBookings: response.pendingBookings || 0,
              upcomingBookings: response.upcomingBookings || 0,
              unreadMessages: response.unreadMessages || 0,
              expiringHolds: response.expiringHolds || 0,
            });
          }
        } catch (error) {
          console.error('Error fetching admin metrics:', error);
        } finally {
          set({ isLoadingMetrics: false });
        }
      },
    }),
    {
      name: 'admin-storage',
      partialize: (state) => ({
        organization: state.organization,
        metrics: state.metrics,
      }),
    }
  )
);