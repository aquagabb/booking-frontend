import React, { useEffect, useRef, useState, useCallback } from "react";
import RestaurantCard from "../../components/shared/RestaurantCard";
import Filters from "../../components/Filters";
import Search from "../../components/Search";
import { useSearchStore } from "../../store/search.store";
import { searchLocations } from "../../api/locations/locations";
import { useSearchParams } from "react-router-dom";
import { format, parseISO } from "date-fns";

const debounce = (fn, delay = 400) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

const Restaurants = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { location, eventType, date, setSearch } = useSearchStore();

  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [similarResults, setSimilarResults] = useState([]);
  const [hasNoDirectResults, setHasNoDirectResults] = useState(false);
  const [filters, setFilters] = useState({
    capacityRange: [],
    facilities: [],
    seatingPlans: [],
    priceRange: [],
    pricingTypes: [],
  });
  const [predefinedFilters, setPredefinedFilters] = useState({});

  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;

    const urlLocation = searchParams.get("term") || "";
    const urlEventType = searchParams.get("eventType") || "";
    const urlDate = searchParams.get("date");

    const urlFacilities = searchParams.get("facilities")?.split(",") || [];
    const urlSeatingPlans = searchParams.get("seatingPlans")?.split(",") || [];
    const urlCapacityRange = searchParams.get("capacityRange")?.split(",") || [];
    const urlPriceRange = searchParams.get("priceRange")?.split(",") || [];
    const urlPricingTypes = searchParams.get("pricingTypes")?.split(",") || [];

    setSearch({
      location: urlLocation,
      eventType: urlEventType
        ? { label: urlEventType, value: urlEventType }
        : null,
      date: urlDate ? parseISO(urlDate) : null,
    });

    setFilters({
      facilities: urlFacilities,
      seatingPlans: urlSeatingPlans,
      capacityRange: urlCapacityRange,
      priceRange: urlPriceRange,
      pricingTypes: urlPricingTypes,
    });

    hasInitialized.current = true;
  }, [searchParams, setSearch]);


  const searchItems = useCallback(
    debounce(async (filters) => {
      try {
        setIsLoading(true);

        const activeFilters = {};
        if (filters.capacityRange && filters.capacityRange.length)
          activeFilters.capacityRange = filters.capacityRange;
        if (filters.facilities && filters.facilities.length)
          activeFilters.facilities = filters.facilities;
        if (filters.seatingPlans && filters.seatingPlans.length)
          activeFilters.seatingPlans = filters.seatingPlans;
        if (filters.priceRange && filters.priceRange.length)
          activeFilters.priceRange = filters.priceRange;
        if (filters.pricingTypes && filters.pricingTypes.length)
          activeFilters.pricingTypes = filters.pricingTypes;
        if (eventType) {
          const eventTypeValue = typeof eventType === "object" && eventType.value != null
            ? String(eventType.value)
            : String(eventType);
          activeFilters.eventType = eventTypeValue;
        }
        // if (date) {
        //   activeFilters.checkIn = format(date, "yyyy-MM-dd");
        // }

        const term = location || "";
        const { response } = await searchLocations(term, activeFilters);

        const directResults = response?.data || [];
        const similar = response?.similar || [];
        
        setResults(directResults);
        setSimilarResults(similar);
        setHasNoDirectResults(directResults.length === 0 && similar.length > 0);
        setPredefinedFilters(response?.filters || {});
      } catch (err) {
        console.error("Error fetching locations:", err);
      } finally {
        setIsLoading(false);
      }
    }, 400),
    [location, eventType, date]
  );

  useEffect(() => {
    if (!hasInitialized.current) return;

    const params = {};
    if (location) params.term = location;
    if (eventType) {
      const eventTypeValue = typeof eventType === 'object' && eventType.value 
        ? String(eventType.value) 
        : String(eventType);
      params.eventType = eventTypeValue;
    }
    if (date) params.date = format(date, "yyyy-MM-dd");

    if (filters.facilities && filters.facilities.length)
      params.facilities = filters.facilities.join(",");
    if (filters.seatingPlans && filters.seatingPlans.length)
      params.seatingPlans = filters.seatingPlans.join(",");
    if (filters.capacityRange && filters.capacityRange.length)
      params.capacityRange = filters.capacityRange.join(",");
    if (filters.priceRange && filters.priceRange.length)
      params.priceRange = filters.priceRange.join(",");
    if (filters.pricingTypes && filters.pricingTypes.length)
      params.pricingTypes = filters.pricingTypes.join(",");

    setSearchParams(params, { replace: true });
  }, [location, eventType, date, filters, setSearchParams]);


  useEffect(() => {
    if (location || eventType || date) searchItems(filters);
  }, [location, eventType, date]);

  useEffect(() => {
    if (!hasInitialized.current) return;
    searchItems(filters);
  }, [filters, searchItems]);

  return (
    <main className="mx-auto">
      <Search />
      <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-6 items-start">
        <div className="lg:sticky lg:top-24 self-start">
          <Filters
            predefinedFilters={predefinedFilters}
            filters={filters}
            onChange={(newFilters) => setFilters(newFilters)}
          />
        </div>

        <div className="flex flex-col gap-4">
          {isLoading ? (
            <div className="text-sm text-gray-500">
              <span>Loading locations...</span>
            </div>
          ) : hasNoDirectResults ? (
            <>
              <div className="text-lg font-semibold text-gray-800">
                No properties found in {location}
              </div>
              
              {similarResults.length > 0 && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-orange-900">
                      <strong>Properties near {location} that match your search</strong>{" "}
                      This property matches your search, but is outside of your search {location}.
                    </p>
                  </div>
                </div>
              )}
              
              <div className="text-sm text-gray-500">
                Found <strong>{similarResults.length}</strong>{" "}
                {similarResults.length === 1 ? "similar property" : "similar properties"}
              </div>
            </>
          ) : (
            <div className="text-sm text-gray-500">
              Found <strong>{results.length}</strong>{" "}
              {results.length === 1 ? "property" : "properties"} matching
              your filters
            </div>
          )}

          {!isLoading && (results.length > 0 || similarResults.length > 0) ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {(hasNoDirectResults ? similarResults : results).map((loc) => (
                <RestaurantCard
                  key={loc.id}
                  name={loc.name}
                  slug={loc.slug}
                  address={loc.address}
                  rating={parseFloat(loc.rating)}
                  ratingCount={loc.ratingCount}
                  maxGuests={loc.maxGuests}
                  photos={loc.photos}
                  locationId={loc.id}
                  viewFavorite={true}
                  pricing={loc.pricing}
                  pricingCategories={loc.pricingCategories}
                />
              ))}
            </div>
          ) : !isLoading ? (
            <p className="text-gray-400">
              No properties found. Try adjusting your filters.
            </p>
          ) : null}
        </div>
      </div>
    </main>
  );
};

export default Restaurants;
