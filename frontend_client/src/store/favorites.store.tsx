import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  getLocationFavorites,
  addLocationToFavorite,
  removeLocationFavorite,
} from '../api/locations/locations.tsx';

const SYNC_INTERVAL = 5 * 60 * 1000;

interface Location {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

/** Stable location id for favorites — prefer `locationId` when both exist (API may use `id` for the favorite row). */
export function getFavoriteEntryKey(entry: unknown): string | null {
  if (!entry || typeof entry !== 'object') return null;
  const e = entry as Record<string, unknown>;
  const raw = e.locationId ?? e.id;
  if (raw == null) return null;
  return String(raw);
}

interface FavoritesState {
  favorites: Location[];
  syncing: boolean;
  lastFetchedAt: number | null;

  syncFromBackend: () => Promise<void>;
  addFavorite: (location: Location) => Promise<void>;
  removeFavorite: (locationId: string) => Promise<void>;
  isFavorite: (locationId: string) => boolean;
  isStale: (ttl?: number) => boolean;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      syncing: false,
      lastFetchedAt: null,

      isStale: (ttl = SYNC_INTERVAL) => {
        const { lastFetchedAt } = get();
        if (!lastFetchedAt) return true;
        return Date.now() - lastFetchedAt > ttl;
      },

      syncFromBackend: async () => {
        set({ syncing: true });
        try {
          const { status, response } = await getLocationFavorites();
          if (status === 200) {
            set({
              favorites: response.data ?? [],
              lastFetchedAt: Date.now(),
            });
          }
        } finally {
          set({ syncing: false });
        }
      },

      addFavorite: async (location) => {
        const { favorites } = get();
        const key = getFavoriteEntryKey(location);
        if (key == null) return;

        // dedupe — backend entries may use `locationId` instead of `id`
        if (favorites.some((f) => getFavoriteEntryKey(f) === key)) return;

        // optimistic
        set({ favorites: [...favorites, location] });

        try {
          const { status } = await addLocationToFavorite(location.id);
          if (status < 200 || status >= 300) throw new Error();
        } catch {
          // rollback
          set({
            favorites: get().favorites.filter(
              (f) => getFavoriteEntryKey(f) !== key
            ),
          });
          // TODO: notificare toast
        }
      },

      removeFavorite: async (locationId) => {
        const previous = get().favorites;
        const idKey = String(locationId);

        // optimistic — match either `id` or `locationId` from API
        set({
          favorites: previous.filter(
            (f) => getFavoriteEntryKey(f) !== idKey
          ),
        });

        try {
          const { status } = await removeLocationFavorite(locationId);
          if (status < 200 || status >= 300) throw new Error();
        } catch {
          // rollback
          set({ favorites: previous });
          // TODO: notificare toast
        }
      },

      isFavorite: (locationId) => {
        const idKey = String(locationId);
        return get().favorites.some((f) => getFavoriteEntryKey(f) === idKey);
      },
    }),
    {
      name: 'favorites_v1',
      // persistăm doar datele, nu stările tranzitorii
      partialize: (state) => ({
        favorites: state.favorites,
        lastFetchedAt: state.lastFetchedAt,
      }),
    }
  )
);