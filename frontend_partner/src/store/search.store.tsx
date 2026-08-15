import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SearchState {
  location: string;
  eventType: { label: string; value: string | number } | null;
  date: Date | null;
  setSearch: (data: Partial<SearchState>) => void;
  clearSearch: () => void;
}

export const useSearchStore = create<SearchState>()(
  persist(
    (set, get) => ({
      location: '',
      eventType: null,
      date: null,
      setSearch: (data) => set({ ...get(), ...data }),
      clearSearch: () => set({ location: '', eventType: null, date: null }),
    }),
    {
      name: 'search',
      merge: (persistedState, currentState) => {
        const state = {
          ...currentState,
          ...(persistedState as SearchState),
        };
        if (state.date && typeof state.date === 'string') {
          state.date = new Date(state.date);
        }
        return state;
      },
    }
  )
);
