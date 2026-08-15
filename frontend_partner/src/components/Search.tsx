import { useState, useEffect, useCallback, useRef } from "react";
import CustomSelect from "./shared/CustomSelect";
import CustomDatePicker from "./shared/CustomDatePicker";
import { Calendar, MapPin, Shapes, Search as SearchIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSearchStore } from "../store/search.store";
import { getGeneralData } from "../api/others/others";
import { format } from "date-fns";
import { searchLocationsSuggestions } from "../api/locations/locations";
import { toSelectOptions } from "../lib/utils";

type SelectOption = { value: string | number; label: string };

type LocationSuggestion = {
  id: number | string;
  type?: string;
  city: string;
  country: string;
  label: string;
};

const Search = () => {
  const navigate = useNavigate();
  const { location, eventType, date, setSearch } = useSearchStore();

  const [categories, setCategories] = useState<SelectOption[]>([]);

  const [localLocation, setLocalLocation] = useState(location || "");
  const [localDate, setLocalDate] = useState<Date | null>(date || null);

  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [locationError, setLocationError] = useState<string>("");
  
  const comboboxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const fetchGeneralData = useCallback(async () => {
    try {
      const { status, response } = await getGeneralData();
      if (status === 200) {
        const formatted = toSelectOptions(response?.data?.categories || []);
        setCategories(formatted);
      }
    } catch (err) {
      console.error("Error fetching general data:", err);
    }
  }, []);

  useEffect(() => {
    fetchGeneralData();
  }, [fetchGeneralData]);

  const fetchLocationsSuggestions = useCallback(async (term: string) => {
    setIsLoadingSuggestions(true);
    try {
      const { status, response } = await searchLocationsSuggestions(term);
      if (status === 200) {
        const suggestions = (response?.data || []) as LocationSuggestion[];
        setSuggestions(suggestions);
      }
    } catch (err) {
      console.error("Error fetching location suggestions:", err);
      setSuggestions([]);
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, []);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (comboboxRef.current && !comboboxRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    setLocalLocation(location || "");
  }, [location]);

  useEffect(() => {
    setLocalDate(date || null);
  }, [date]);

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalLocation(value);
    setShowSuggestions(true);
    // Clear error when user starts typing
    if (locationError) {
      setLocationError("");
    }

    // Clear previous debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Debounce API call - wait 300ms after user stops typing
    debounceTimerRef.current = setTimeout(() => {
      const searchTerm = value.trim();
      fetchLocationsSuggestions(searchTerm);
    }, 300);
  };

  const handleLocationFocus = () => {
    setShowSuggestions(true);
    // Fetch suggestions for current input value
    const searchTerm = localLocation.trim();
    if (searchTerm || suggestions.length === 0) {
      fetchLocationsSuggestions(searchTerm);
    }
  };

  const handleLocationKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setShowSuggestions(false);
      inputRef.current?.blur();
    } else if (e.key === "Enter") {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionSelect = (suggestion: LocationSuggestion) => {
    setLocalLocation(suggestion.label);
    setShowSuggestions(false);
    inputRef.current?.blur();
  };

  const handleSearch = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault();
      setShowSuggestions(false);

      // Validate location is not empty
      if (!localLocation || !localLocation.trim()) {
        setLocationError("Vă rugăm să introduceți destinația pentru a începe căutarea.");
        return;
      }

      // Clear error if validation passes
      setLocationError("");

      setSearch({
        location: localLocation,
        eventType: eventType,
        date: localDate,
      });

      const params = new URLSearchParams();
      if (localLocation) params.set("term", localLocation);
      if (eventType) params.set("eventType", String(eventType.value));
      if (localDate) params.set("date", format(localDate, "yyyy-MM-dd"));

      navigate(`/restaurants?${params.toString()}`);
    },
    [localLocation, eventType, localDate, navigate, setSearch]
  );



  return (
    <section className="pb-4">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-sm p-6 border border-gray-200">
          <form onSubmit={handleSearch}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative" ref={comboboxRef}>
                <label className="block text-sm font-semibold mb-2 text-gray-dark">
                  Location
                </label>
                <div className="relative w-full">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none z-10">
                    <MapPin className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    ref={inputRef}
                    type="text"
                    value={localLocation}
                    onChange={handleLocationChange}
                    onFocus={handleLocationFocus}
                    onKeyDown={handleLocationKeyDown}
                    placeholder="Where do you want to go?"
                    className={`block w-full h-10  text-base md:text-sm pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                      locationError ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                </div>
                {locationError && (
                  <div className="absolute z-50 w-full mt-1 bg-red-600 text-white text-sm px-4 py-2 rounded-md">
                    {locationError}
                  </div>
                )}
                {showSuggestions && (
                  <div className="absolute z-50 min-w-[350px] w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {isLoadingSuggestions ? (
                      <div className="px-4 py-2 text-sm text-gray-500">Loading...</div>
                    ) : suggestions.length > 0 ? (
                      suggestions.map((suggestion) => (
                        <button
                          key={suggestion.id}
                          type="button"
                          onClick={() => handleSuggestionSelect(suggestion)}
                          className="w-full text-left px-4 py-3 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none transition-colors flex items-start gap-3"
                        >
                          <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                          <div className="flex flex-col">
                            <span className="font-semibold text-sm text-gray-900">
                              {suggestion.city}
                            </span>
                            <span className="text-sm text-gray-600">
                              {suggestion.label}
                            </span>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-2 text-sm text-gray-500">No locations found</div>
                    )}
                  </div>
                )}
              </div>

              <CustomDatePicker
                label="Date"
                selected={localDate}
                onChange={setLocalDate}
                iconLeft={<Calendar className="w-5 h-5 text-gray-400" />}
                placeholder="Selectează data"
                showTimeSelect={false}
              />

              <CustomSelect
                label="Event type"
                value={categories.find((cat) =>
                  eventType && (cat.value === eventType.value || String(cat.value) === String(eventType.value))
                ) || null}
                onChange={(option) => setSearch({ eventType: option })}
                options={categories}
                isSearchable={false}
                isMulti={false}
                placeholder="No selection"
                iconLeft={<Shapes className="w-5 h-5 text-gray-400" />}
              />

              <div className="flex items-end">
                <button
                  type="submit"
                  className="btn-primary w-full "
                >
             
                  Search
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Search;
