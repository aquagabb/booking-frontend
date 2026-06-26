import React from "react";

interface Item {
  value: string | number;
  label: string;
  count?: number;
}

interface FilterListProps {
  title: string;
  items: Item[];
  activeValues: (string | number)[];
  onChange: (newValues: (string | number)[]) => void;
  singleSelect?: boolean; 
}

const FilterList: React.FC<FilterListProps> = ({
  title,
  items,
  activeValues,
  onChange,
  singleSelect = false,
}) => {
  const toggleValue = (val: string | number) => {
    const isSelected = activeValues.includes(val);
    if (singleSelect) {
      onChange(isSelected ? [] : [val]);
    } else {
      const updated = isSelected
        ? activeValues.filter((v) => v !== val)
        : [...activeValues, val];
      onChange(updated);
    }
  };

  return (
    <section className="p-1">
      <h4 className="mb-2 font-semibold">{title}</h4>
      <div className="flex flex-col gap-2">
        {items.map((item) => {
          const selected = activeValues.includes(item.value);
          return (
            <label
              key={item.value}
              className="flex items-center gap-2 cursor-pointer text-sm hover:bg-gray-50 rounded-md px-2 py-1"
            >
              <input
                type="checkbox"
                checked={selected}
                onChange={() => toggleValue(item.value)}
                className="form-checkbox accent-primary"
              />
              <span>{item.label}</span>
              {item.count !== undefined && (
                <span className="ml-auto text-xs text-gray-500">
                  ({item.count})
                </span>
              )}
            </label>
          );
        })}
      </div>
    </section>
  );
};

export default FilterList;
