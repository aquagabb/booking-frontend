import React from 'react';
import Select from 'react-select';
import type { GroupBase, StylesConfig } from 'react-select';

interface Option {
  value: string | number;
  label: string;
}

interface CustomSelectProps {
  label?: string;
  value: Option | Option[] | null;
  onChange: (value: any) => void;
  options: Option[];
  isMulti?: boolean;
  isSearchable?: boolean;
  placeholder?: string;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  required?: boolean;
  error?: string;
  isDisabled?: boolean;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  label,
  value,
  onChange,
  options,
  isMulti = false,
  isSearchable = false,
  placeholder = 'No selection',
  iconLeft,
  iconRight,
  required = false,
  error,
  isDisabled = false,
}) => {
  const customStyles: StylesConfig<Option, boolean, GroupBase<Option>> = {
    control: (provided, state) => ({
      ...provided,
      height: '40px',
      minHeight: '40px',
      paddingLeft: iconLeft ? '2.5rem' : '1rem',
      paddingRight: iconRight ? '2.5rem' : '1rem',
      borderRadius: '0.5rem',
      borderColor: error ? '#EF4444' : (state.isFocused ? '#0ea5e9' : '#D1D5DB'),
      boxShadow: error
        ? '0 0 0 1px rgba(239, 68, 68, 0.8)'
        : (state.isFocused ? '0 0 0 2px rgba(14, 165, 233, 0.4)' : undefined),
      backgroundColor: '#ffffff',
      fontSize: '0.875rem',
      lineHeight: '1.25rem',
      border: '1px solid',
      cursor: 'pointer',
      '&:hover': {
        borderColor: error ? '#EF4444' : '#0ea5e9',
      },
    }),
    placeholder: (provided) => ({
      ...provided,
      color: '#9CA3AF',
      fontSize: '0.875rem',
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 9999,
      borderRadius: '0.75rem',
      border: '1px solid #e5e7eb',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      marginTop: '8px',
      overflowX: 'hidden',
    }),
    menuList: (provided) => ({
      ...provided,
      padding: '0.25rem',
      overflowX: 'hidden',
    }),
    option: (provided, state) => ({
      ...provided,
      borderRadius: '0.5rem',
      margin: '0.0625rem 0',
      padding: '0.5rem',
      fontSize: '0.875rem',
      backgroundColor: state.isSelected
        ? '#0ea5e9'
        : state.isFocused
        ? '#f3f4f6'
        : 'transparent',
      color: state.isSelected ? 'white' : '#111827',
      fontWeight: state.isSelected ? 600 : 'normal',
      cursor: 'pointer',
      '&:active': {
        backgroundColor: state.isSelected ? '#0284c7' : '#f3f4f6',
      },
    }),
    singleValue: (provided) => ({
      ...provided,
      color: '#111827',
      fontSize: '0.875rem',
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      fontSize: '0.75rem',
    }),
    indicatorSeparator: () => ({
      display: 'none',
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      color: '#6b7280',
      padding: '0.5rem',
      '&:hover': {
        color: '#111827',
      },
    }),
  };

  return (
    <div className="relative">
      {label && (
        <label className="block text-sm font-semibold text-gray-dark mb-2">
          {label} {required && <span className="text-red-600">*</span>}
        </label>
      )}
      <div className="relative w-full h-10">
        {iconLeft && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none z-10">
            {iconLeft}
          </div>
        )}
        <Select
          value={value}
          onChange={onChange}
          options={options}
          isMulti={isMulti}
          isSearchable={isSearchable}
          placeholder={placeholder}
          styles={customStyles}
          className="react-select-container"
          classNamePrefix="react-select"
          required={required}
          isDisabled={isDisabled}
        />
        {iconRight && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none z-10">
            {iconRight}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomSelect;
