import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface CustomDatePickerProps {
  label?: string;
  selected: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  required?: boolean;
  minDate?: Date;
  maxDate?: Date;
  showTimeSelect?: boolean;
  dateFormat?: string;
  disablePastDates?: boolean;
  dayClassName?: (date: Date) => string | undefined | null;
}

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  label,
  selected,
  onChange,
  placeholder = 'Selectează data',
  iconLeft,
  iconRight,
  required = false,
  minDate,
  maxDate,
  showTimeSelect = false,
  dateFormat,
  disablePastDates = true,
  dayClassName,
}) => {
  // Calculează minDate-ul final: dacă disablePastDates este true și nu există deja un minDate, folosește data de azi
  const getMinDate = (): Date | undefined => {
    if (minDate) {
      return minDate;
    }
    if (disablePastDates) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return today;
    }
    return undefined;
  };

  const finalMinDate = getMinDate();
  
  // Dacă nu există o dată selectată, setăm openToDate la data de azi pentru a afișa luna curentă
  const getOpenToDate = (): Date | undefined => {
    if (selected) {
      return undefined; // Dacă există o dată selectată, folosește-o
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  };

  const openToDate = getOpenToDate();
  
  const CustomInput = React.forwardRef<HTMLInputElement, any>(
    ({ value, onClick }, ref) => (
      <div className="relative w-full h-10">
        {iconLeft && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none z-10">
            {iconLeft}
          </div>
        )}
        <input
          ref={ref}
          onClick={onClick}
          value={value}
          readOnly
          placeholder={placeholder}
          required={required}
          className={`block w-full h-10 bg-white text-base md:text-sm px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 cursor-pointer
            ${iconLeft ? 'pl-10' : ''} ${iconRight ? 'pr-10' : ''}`}
        />
        {iconRight && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none z-10">
            {iconRight}
          </div>
        )}
      </div>
    )
  );

  return (
    <div className='relative'>
      {label && (
        <label className="block text-sm font-semibold text-gray-dark mb-2">
          {label}
        </label>
      )}
      <style>{`
        .react-datepicker-popper,
        .react-datepicker-popper-custom {
          z-index: 9999 !important;
        }
        .react-datepicker-popper[data-placement^="bottom"],
        .react-datepicker-popper-custom[data-placement^="bottom"] {
          padding-top: 8px;
        }
        .react-datepicker__triangle {
          display: none !important;
        }
        .react-datepicker {
          display: flex;
          align-items: flex-start;
          font-family: inherit;
          border: 1px solid #e5e7eb;
          border-radius: 0.75rem;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          padding: 0.625rem;
        }
        .react-datepicker__header {
          background-color: white;
          border-bottom: 1px solid #e5e7eb;
          padding-top: 0.5rem;
          padding-bottom: 0.5rem;
        }
        .react-datepicker__current-month {
          font-weight: 600;
          font-size: 0.8125rem;
          color: #111827;
          margin-bottom: 0.375rem;
        }
        .react-datepicker__day-names {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.25rem;
        }
        .react-datepicker__day-name {
          width: 1.85rem;
          line-height: 1.85rem;
          color: #6b7280;
          font-size: 0.7rem;
          font-weight: 500;
          text-transform: capitalize;
        }
        .react-datepicker__month {
          margin: 0;
        }
        .react-datepicker__week {
          display: flex;
          justify-content: space-between;
        }
        .react-datepicker__day {
          width: 1.85rem;
          height: 1.85rem;
          line-height: 1.85rem;
          margin: 0.1rem;
          border-radius: 0.5rem;
          color: #111827;
          font-size: 0.8rem;
          transition: all 0.2s;
        }
        .react-datepicker__day:hover {
          background-color: #f3f4f6;
          border-radius: 0.5rem;
        }
        .react-datepicker__day--selected {
          background-color: #0ea5e9;
          color: white;
          font-weight: 600;
          border-radius: 0.5rem;
        }
        .react-datepicker__day--selected:hover {
          background-color: #0284c7;
        }
        .react-datepicker__day--keyboard-selected {
          background-color: transparent;
          color: #111827;
        }
        .react-datepicker__day--keyboard-selected:hover {
          background-color: #f3f4f6;
        }
        .react-datepicker__day--disabled {
          color: #9ca3af;
          cursor: not-allowed;
          opacity: 0.5;
        }
        .react-datepicker__day--disabled:hover {
          background-color: transparent;
        }
        .react-datepicker__navigation--previous--disabled,
        .react-datepicker__navigation--previous--disabled:hover {
          cursor: not-allowed;
          opacity: 0.5;
        }
        .react-datepicker__day--today {
          font-weight: 600;
        }
        .react-datepicker__navigation {
          top: 1rem;
        }
        .react-datepicker__navigation-icon::before {
          border-color: #6b7280;
        }
        .react-datepicker__navigation:hover *::before {
          border-color: #111827;
        }
        .react-datepicker__month-container {
          float: none;
        }
        .react-datepicker__time-container {
          float: none;
          width: 70px;
          margin-left: 0.5rem;
        }
        .react-datepicker__time-container .react-datepicker__time-box {
          width: 70px !important;
        }
        .react-datepicker__time-list-item {
          padding: 4px !important;
          font-size: 0.8rem;
        }
        .react-datepicker__day.day-has-events {
          position: relative;
          background-color: rgba(245, 158, 11, 0.14);
        }
        .react-datepicker__day.day-has-events:hover {
          background-color: rgba(245, 158, 11, 0.24);
        }
        .react-datepicker__day.day-has-events::after {
          content: '';
          position: absolute;
          bottom: 3px;
          left: 50%;
          transform: translateX(-50%);
          width: 4px;
          height: 4px;
          border-radius: 9999px;
          background-color: var(--color-accent);
        }
        .react-datepicker__day.day-has-events.react-datepicker__day--selected {
          background-color: #0ea5e9;
        }
        .react-datepicker__day.day-has-events.react-datepicker__day--selected::after {
          background-color: white;
        }
      `}</style>
      <DatePicker
        selected={selected}
        onChange={onChange}
        showTimeSelect={showTimeSelect}
        timeIntervals={showTimeSelect ? 15 : undefined}
        timeCaption={showTimeSelect ? "Ora" : undefined}
        placeholderText={placeholder}
        dateFormat={dateFormat || (showTimeSelect ? "dd/MM/yyyy HH:mm" : "dd MMMM yyyy")}
        minDate={finalMinDate}
        maxDate={maxDate}
        monthsShown={1}
        popperPlacement="bottom-start"
        popperProps={{ strategy: 'fixed' }}
        openToDate={openToDate}
        wrapperClassName="w-full"
        customInput={<CustomInput />}
        dayClassName={dayClassName}
        formatWeekDay={(dayName) => {
          const dayMap: { [key: string]: string } = {
            'Monday': 'lun.',
            'Tuesday': 'mar.',
            'Wednesday': 'mie.',
            'Thursday': 'joi',
            'Friday': 'vin.',
            'Saturday': 'sâm.',
            'Sunday': 'dum.'
          };
          return dayMap[dayName] || dayName.substring(0, 3);
        }}
      />
    </div>
  );
};

export default CustomDatePicker;
