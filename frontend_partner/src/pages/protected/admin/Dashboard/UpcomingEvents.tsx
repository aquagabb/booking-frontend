import { useNavigate } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import EventCard from './EventCard';
import type { Booking } from './types';

const UpcomingEvents = ({
  bookings,
  onBookingClick,
}: {
  bookings: Booking[];
  onBookingClick: (bookingId: string) => void;
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const sortedBookings = [...bookings].sort((a, b) => {
    return new Date(a.checkIn).getTime() - new Date(b.checkIn).getTime();
  });

  const upcomingBookings = sortedBookings.slice(0, 5);

  return (
    <div className="h-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-secondary">{t('dashboard.upcoming_events')}</h2>
        <button
          onClick={() => navigate('/partner/bookings?status=confirmed')}
          className="text-sm text-primary hover:underline font-medium transition-colors"
        >
          {t('common.view_all')}
        </button>
      </div>

      <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
        {upcomingBookings.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No upcoming events</p>
          </div>
        ) : (
          upcomingBookings.map((booking: Booking, index: number) => (
            <EventCard
              key={`${booking.id}-${index}`}
              booking={booking}
              variant="confirmed"
              onClick={() => onBookingClick(String(booking.id))}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default UpcomingEvents;
