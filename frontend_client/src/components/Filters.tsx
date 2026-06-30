import React, { useEffect, useState } from "react";
import { getGeneralData } from "../api/others/others";
import FilterList from "./FilterList";

type FilterOption = {
  label: string;
  value: string | number;
  count?: number;
};

type FilterState = {
  capacityRange?: (string | number)[];
  facilities?: (string | number)[];
  seatingPlans?: (string | number)[];
  priceRange?: (string | number)[];
  pricingTypes?: (string | number)[];
};

interface FiltersProps {
  predefinedFilters: Record<string, any>;
  filters: FilterState;
  onChange: (v: FilterState) => void;
}

const Filters: React.FC<FiltersProps> = ({
  predefinedFilters,
  filters,
  onChange,
}) => {
  const [availableFilters, setAvailableFilters] = useState<{
    capacityRange: FilterOption[];
    facilities: FilterOption[];
    seatingPlans: FilterOption[];
    priceRange: FilterOption[];
    pricingTypes: FilterOption[];
  }>({
    capacityRange: [],
    facilities: [],
    seatingPlans: [],
    priceRange: [],
    pricingTypes: [],
  });

  const PRICE_RANGE_LABELS: Record<string, string> = {
    "0_200": "0 - 200 €",
    "200_500": "200 - 500 €",
    "500_1000": "500 - 1.000 €",
    "1000_2000": "1.000 - 2.000 €",
    "2000_plus": "2.000+ €",
  };

  const PRICING_TYPE_LABELS: Record<string, string> = {
    poa: "Price on application",
    per_guest: "Per guest",
    per_day: "Per day",
    per_hour: "Per hour",
  };

  const mapFilterData = (
    items: { id: number; name: string }[] = [],
    predefined: Record<number, number> = {}
  ) => {
    return items
      .map((item) => ({
        label: item.name,
        value: item.id,
        count: predefined[item.id] ?? 0,
      }))
      .filter((item) => item.count > 0);
  };

  const mapStringKeyFilterData = (
    items: { id?: string | number; key?: string; name: string }[] = [],
    predefined: Record<string, number> = {},
    fallbackLabels: Record<string, string> = {}
  ) => {
    if (items.length > 0) {
      return items
        .map((item) => {
          const key = String(item.key ?? item.id ?? "");
          return {
            label: item.name,
            value: key,
            count: predefined[key] ?? 0,
          };
        })
        .filter((item) => item.count > 0);
    }

    return Object.entries(predefined)
      .filter(([, count]) => count > 0)
      .map(([key, count]) => ({
        label: fallbackLabels[key] || key.replace(/_/g, " "),
        value: key,
        count,
      }));
  };

  const setFilter = (partial: Partial<FilterState>) =>
    onChange({ ...filters, ...partial });
  const fetchGeneralData = async () => {
    const { status, response } = await getGeneralData();
    if (status !== 200) return;

    const data = response?.data ?? {};

    const facilities = mapFilterData(data.facilities, predefinedFilters?.facilities);
    const seatingPlans = mapFilterData(data.seatingPlans, predefinedFilters?.seatingPlans);
    const capacityRange = mapFilterData(data.capacityRange, predefinedFilters?.capacityRange);
    const priceRange = mapStringKeyFilterData(
      data.priceRange,
      predefinedFilters?.priceRange,
      PRICE_RANGE_LABELS
    );
    const pricingTypes = mapStringKeyFilterData(
      data.pricingTypes,
      predefinedFilters?.pricingTypes,
      PRICING_TYPE_LABELS
    );

    setAvailableFilters({
      capacityRange,
      facilities,
      seatingPlans,
      priceRange,
      pricingTypes,
    });
  };
  useEffect(() => {
    fetchGeneralData();
  }, [predefinedFilters]);

  return (
    <aside className="rounded-md border border-gray-200 p-4 space-y-4">
      <FilterList
        title="Capacity Range"
        items={availableFilters.capacityRange}
        activeValues={filters.capacityRange ?? []}
        onChange={(newValues) => setFilter({ capacityRange: newValues })}
      />

      <FilterList
        title="Seating Plans"
        items={availableFilters.seatingPlans}
        activeValues={filters.seatingPlans ?? []}
        onChange={(newValues) => setFilter({ seatingPlans: newValues })}
      />

      <FilterList
        title="Facilities"
        items={availableFilters.facilities}
        activeValues={filters.facilities ?? []}
        onChange={(newValues) => setFilter({ facilities: newValues })}
      />

      <FilterList
        title="Price Range"
        items={availableFilters.priceRange}
        activeValues={filters.priceRange ?? []}
        onChange={(newValues) => setFilter({ priceRange: newValues })}
      />

      <FilterList
        title="Pricing Type"
        items={availableFilters.pricingTypes}
        activeValues={filters.pricingTypes ?? []}
        onChange={(newValues) => setFilter({ pricingTypes: newValues })}
      />

      <button
        onClick={() =>
          onChange({
            capacityRange: [],
            seatingPlans: [],
            facilities: [],
            priceRange: [],
            pricingTypes: [],
          })
        }
        className="mt-4 w-full rounded-md border border-gray-300 py-2 text-sm hover:bg-gray-100"
      >
        Reset filters
      </button>
    </aside>
  );
};

export default Filters;
