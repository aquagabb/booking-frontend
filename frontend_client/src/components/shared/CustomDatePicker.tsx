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
          font-family: inherit;
          border: 1px solid #e5e7eb;
          border-radius: 0.75rem;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          padding: 1rem;
        }
        .react-datepicker__header {
          background-color: white;
          border-bottom: 1px solid #e5e7eb;
          padding-top: 0.75rem;
          padding-bottom: 0.75rem;
        }
        .react-datepicker__current-month {
          font-weight: 600;
          font-size: 0.875rem;
          color: #111827;
          margin-bottom: 0.5rem;
        }
        .react-datepicker__day-names {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
        }
        .react-datepicker__day-name {
          width: 2.5rem;
          line-height: 2.5rem;
          color: #6b7280;
          font-size: 0.75rem;
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
          width: 2.5rem;
          height: 2.5rem;
          line-height: 2.5rem;
          margin: 0.125rem;
          border-radius: 0.5rem;
          color: #111827;
          font-size: 0.875rem;
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
        openToDate={openToDate}
        wrapperClassName="w-full"
        customInput={<CustomInput />}
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
