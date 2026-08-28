import { useNavigate } from 'react-router-dom';
import { ClipboardList, Clock } from 'lucide-react';
import EventCard from './EventCard';
import type { Booking } from './types';

const PendingBookings = ({
  bookings,
  isLoading,
  onBookingClick,
}: {
  bookings: Booking[];
  isLoading: boolean;
  onBookingClick: (bookingId: string) => void;
}) => {
  const navigate = useNavigate();

  return (
    <div className="h-full">
      <div className="flex items-center justify-between mb-6">
           <div>
            <h2 className="text-lg font-semibold text-secondary">
              Rezervări în așteptare{!isLoading && ` (${bookings.length})`}
            </h2>
          </div>
        <button
          type="button"
          onClick={() => navigate('/partner/bookings/manage')}
          className="text-sm text-primary hover:underline font-medium transition-colors"
        >
          Vezi toate
        </button>
      </div>

      <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
        {isLoading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-20 rounded-lg border border-[var(--color-gray)] bg-white/80 animate-pulse"
              />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-12">
            <ClipboardList className="w-12 h-12 text-[var(--color-gray)] mx-auto mb-3" />
            <p className="text-muted text-sm">
              Nicio pre-rezervare în așteptare. Cererile noi vor apărea aici.
            </p>
          </div>
        ) : (
          bookings.map((booking, index) => (
            <EventCard
              key={`${booking.id}-${index}`}
              booking={booking}
              variant="pending"
              onClick={() => onBookingClick(String(booking.id))}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default PendingBookings;
