export type AddressSuggestion = {
  id: string;
  label: string;
  // La integrarea reală, aici am popula lat/lng din Google Places Details API.
  lat?: number;
  lng?: number;
};

const DUMMY_ADDRESSES: AddressSuggestion[] = [
  { id: "1", label: "Bulevardul Unirii 10, București" },
  { id: "2", label: "Strada Memorandumului 28, Cluj-Napoca" },
  { id: "3", label: "Bulevardul Mamaia 100, Constanța" },
  { id: "4", label: "Strada Lipscani 5, București" },
  { id: "5", label: "Calea Dorobanților 99, București" },
  { id: "6", label: "Piața Unirii 1, Timișoara" },
  { id: "7", label: "Strada Republicii 12, Brașov" },
  { id: "8", label: "Bulevardul Decebal 15, Iași" },
];

/**
 * TODO integrare reală: înlocuiește corpul funcției cu un apel către Google Places
 * Autocomplete API (ex. `AutocompleteSuggestion.fetchAutocompleteSuggestions`).
 * Semnătura (async, primește query, întoarce `AddressSuggestion[]`) rămâne aceeași,
 * deci `StepGeneralInfo` nu trebuie modificat la integrare — doar acest fișier.
 */
export async function searchAddressSuggestions(query: string): Promise<AddressSuggestion[]> {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return DUMMY_ADDRESSES.filter((a) => a.label.toLowerCase().includes(q));
}
