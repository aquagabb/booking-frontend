import { useEffect } from 'react';
import { useFavoritesStore } from '../../../../../store/favorites.store';

const SYNC_INTERVAL = 5 * 60 * 1000;

export type UseFavoritesOptions = {
  /** When true, always refetch from API on mount (e.g. Favorites screen). */
  forceSyncOnMount?: boolean;
};

export function useFavorites(options?: UseFavoritesOptions) {
  const forceSyncOnMount = options?.forceSyncOnMount ?? false;
  const store = useFavoritesStore();

  // sync la mount: forțat sau doar dacă e stale
  useEffect(() => {
    const { syncFromBackend, isStale } = useFavoritesStore.getState();
    if (forceSyncOnMount) {
      void syncFromBackend();
    } else if (isStale()) {
      void syncFromBackend();
    }
  }, [forceSyncOnMount]);

  // sync periodic
  useEffect(() => {
    const id = setInterval(() => {
      if (store.isStale()) store.syncFromBackend();
    }, SYNC_INTERVAL);
    return () => clearInterval(id);
  }, []);

  // sync la tab focus / reconnect
  useEffect(() => {
    const onFocus = () => {
      if (store.isStale(60_000)) store.syncFromBackend();
    };
    window.addEventListener('focus', onFocus);
    window.addEventListener('online', store.syncFromBackend);
    return () => {
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('online', store.syncFromBackend);
    };
  }, []);

  return store;
}