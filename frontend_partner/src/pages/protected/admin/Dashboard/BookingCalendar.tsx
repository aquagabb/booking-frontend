import clsx from 'clsx';
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getCurrentDate } from './utils';
import type { Booking } from './types';

const BookingCalendar = ({
  bookings,
  onDateClick,
}: {
  bookings: Booking[];
  onDateClick: (date: Date) => void;
}) => {
  const [currentDate, setCurrentDate] = useState(getCurrentDate());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();

  const prevMonthLastDay = new Date(year, month, 0).getDate();

  const eventsByDate = bookings.reduce((acc: Record<string, Booking[]>, booking: Booking) => {
    const date = new Date(booking.checkIn);
    const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(booking);
    return acc;
  }, {} as Record<string, Booking[]>);

  const getEventsForDate = (day: number) => {
    const dateKey = `${year}-${month}-${day}`;
    return eventsByDate[dateKey] || [];
  };

  const handleDateClick = (day: number) => {
    const events = getEventsForDate(day);
    if (events.length > 0) {
      const clickedDate = new Date(year, month, day);
      onDateClick(clickedDate);
    }
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const monthName = currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="bg-white rounded-xl shadow p-4 h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-base font-semibold text-gray-900">Active Events Calendar</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={goToPreviousMonth}
            className="p-1 hover:bg-gray-100 rounded-md transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
          <span className="text-xs font-medium text-gray-700 min-w-[100px] text-center">
            {monthName}
          </span>
          <button
            onClick={goToNextMonth}
            className="p-1 hover:bg-gray-100 rounded-md transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-0.5 text-center text-xs text-gray-500 font-medium mb-2">
        <div className="py-1">S</div>
        <div className="py-1">M</div>
        <div className="py-1">T</div>
        <div className="py-1">W</div>
        <div className="py-1">T</div>
        <div className="py-1">F</div>
        <div className="py-1">S</div>
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {Array.from({ length: startingDayOfWeek }, (_, i) => {
          const day = prevMonthLastDay - startingDayOfWeek + i + 1;
          return (
            <div
              key={`prev-${day}`}
              className="aspect-square flex items-center justify-center text-xs text-gray-300"
            >
              {day}
            </div>
          );
        })}

        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const events = getEventsForDate(day);
          const eventCount = events.length;
          const hasEvents = eventCount > 0;
          const today = getCurrentDate();
          const isToday =
            day === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear();

          let eventColorClass = '';
          let indicatorColor = '';
          if (hasEvents) {
            if (eventCount >= 4) {
              eventColorClass = 'bg-green-100 hover:bg-green-200';
              indicatorColor = 'bg-green-500';
            } else if (eventCount >= 2) {
              eventColorClass = 'bg-orange-100 hover:bg-orange-200';
              indicatorColor = 'bg-orange-500';
            } else {
              eventColorClass = 'bg-yellow-100 hover:bg-yellow-200';
              indicatorColor = 'bg-yellow-500';
            }
          }

          return (
            <div
              key={day}
              onClick={() => handleDateClick(day)}
              className={clsx(
                "aspect-square flex flex-col items-center justify-center text-xs rounded-md transition-all cursor-pointer relative",
                isToday && "ring-2 ring-blue-400",
                hasEvents && eventColorClass,
                !hasEvents && !isToday && "hover:bg-gray-50 text-gray-800",
                hasEvents && !isToday && "text-gray-800 font-medium",
                isToday && hasEvents && "text-blue-700 font-semibold",
                isToday && !hasEvents && "bg-blue-50 text-blue-600 font-semibold"
              )}
            >
              <span>{day}</span>
              {hasEvents && (
                <span className={clsx(
                  "absolute bottom-1.5 w-2 h-2 rounded-full",
                  indicatorColor
                )}></span>
              )}
            </div>
          );
        })}

        {/* Next month padding */}
        {Array.from({ length: (42 - startingDayOfWeek - daysInMonth) }, (_, i) => {
          const day = i + 1;
          return (
            <div
              key={`next-${day}`}
              className="aspect-square flex items-center justify-center text-xs text-gray-300"
            >
              {day}
            </div>
          );
        })}
      </div>

    </div>
  );
};

export default BookingCalendar;
