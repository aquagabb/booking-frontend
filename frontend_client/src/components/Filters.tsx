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
  }>({
    capacityRange: [],
    facilities: [],
    seatingPlans: [],
  });


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

  const setFilter = (partial: Partial<FilterState>) =>
    onChange({ ...filters, ...partial });
  const fetchGeneralData = async () => {
    const { status, response } = await getGeneralData();
    if (status !== 200) return;

    const data = response?.data ?? {};

    const facilities = mapFilterData(data.facilities, predefinedFilters?.facilities);
    const seatingPlans = mapFilterData(data.seatingPlans, predefinedFilters?.seatingPlans);
    const capacityRange = mapFilterData(data.capacityRange, predefinedFilters?.capacityRange);

    setAvailableFilters({
      capacityRange,
      facilities,
      seatingPlans,
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

      <button
        onClick={() =>
          onChange({
            capacityRange: [],
            seatingPlans: [],
            facilities: [],
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
