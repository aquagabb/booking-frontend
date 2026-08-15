import clsx from 'clsx';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Users, AlertCircle, Calendar, AlertTriangle, Building2, ClipboardList, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAdminStore } from '../../../store/admin.store';
import CustomModal from '../../../components/shared/Modals/CustomModal';
import { getBookings } from '../../../api/bookings/bookings';
import { formatDate, getPendingExpiryUrgency } from '../../../lib/utils';
import Overview from './Bookings/Overview';


const getCurrentDate = () => new Date();

type Booking = {
  id: number;
  code: string;
  eventName: string;
  locationName: string;
  status: string;
  guests: number;
  totalPrice: number;
  userId: number;
  customerId: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  checkIn: string;
  checkOut: string;
  createdAt: string;
  additionalInfo?: string;
  cancellationReason?: string | null;
  expiresAt?: string;
  pendingConfirmationExpiresAt?: string;
  expirationDate?: string;
};

const pendingStatusLabel = (status: string): string => {
  switch (status) {
    case 'awaiting_client':
      return 'În ofertare';
    case 'on_hold':
      return 'În așteptare / blocat';
    case 'pending':
    default:
      return 'Așteaptă confirmare';
  }
};

const EventCard = ({ 
  booking, 
  onClick,
  variant = 'confirmed',
  compact = false,
}: { 
  booking: Booking; 
  onClick?: () => void;
  variant?: 'confirmed' | 'pending';
  compact?: boolean;
}) => {
  const isPending = variant === 'pending';
  const checkInDate = booking.checkIn ? new Date(booking.checkIn) : null;

  if (isPending && compact) {
    const resolvedExpires =
      booking.expiresAt ||
      booking.pendingConfirmationExpiresAt ||
      booking.expirationDate;
    const expiryUrgency = getPendingExpiryUrgency(resolvedExpires);

    return (
      <div
        className={clsx(
          'border rounded-lg px-3 py-2 flex flex-col gap-1.5 transition-all border-gray-200 min-h-[4rem]',
          onClick && 'cursor-pointer hover:border-gray-300 hover:shadow-sm',
        )}
        onClick={onClick}
      >
        {expiryUrgency.show && (
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-950">
            <Clock className="w-3 h-3 flex-shrink-0 text-amber-700" aria-hidden />
            <span>Răspunde în {expiryUrgency.label}</span>
          </div>
        )}
        <div className="min-w-0 flex-1 flex flex-col justify-center gap-0.5 overflow-hidden">
          <div className="flex items-center gap-2 min-w-0 flex-wrap">
            <span className="font-semibold text-sm text-gray-900 truncate">{booking.locationName}</span>
          </div>
          <div className="flex items-center gap-x-1.5 gap-y-0 text-xs text-gray-600 min-w-0">
            <span className="truncate font-medium text-gray-700">{booking.eventName}</span>
            <span className="text-gray-300 flex-shrink-0">·</span>
            <span className="flex-shrink-0 whitespace-nowrap">
              {booking.checkIn ? formatDate(booking.checkIn) : '—'}
            </span>
            <span className="text-gray-300 flex-shrink-0">·</span>
            <span className="flex-shrink-0">{booking.guests} guests</span>
          </div>
        </div>
      </div>
    );
  }

  const currentDate = getCurrentDate();
  const isToday =
    checkInDate !== null && checkInDate.toDateString() === currentDate.toDateString();
  const isTomorrow =
    checkInDate !== null &&
    checkInDate.toDateString() ===
      new Date(currentDate.getTime() + 24 * 60 * 60 * 1000).toDateString();

  const daysUntilEvent =
    checkInDate !== null
      ? Math.ceil((checkInDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24))
      : 0;

  const isNextMonth =
    checkInDate !== null &&
    (checkInDate.getMonth() !== currentDate.getMonth() ||
      checkInDate.getFullYear() !== currentDate.getFullYear()) &&
    daysUntilEvent > 0;

  const getDaysLabel = () => {
    if (isNextMonth) {
      return 'luna următoare';
    }

    else if (daysUntilEvent > 0 && daysUntilEvent <= 30 && !isToday && !isTomorrow) {
      return `in ${daysUntilEvent} de zile`;
    }

    return null;
  };
  
  const daysLabel = getDaysLabel();

  const expiryUrgency =
    isPending
      ? getPendingExpiryUrgency(
          booking.expiresAt || booking.pendingConfirmationExpiresAt || booking.expirationDate
        )
      : { show: false, label: '' };

  return (
    <div
      className={clsx(
        "border rounded-lg p-4 hover:shadow-lg transition-all bg-white",
        onClick && "cursor-pointer",
        !isToday && "border-gray-200",
        isToday && "border-blue-300 bg-blue-50/30",
        isPending && expiryUrgency.show && "border-amber-400 bg-amber-50/30 ring-1 ring-amber-200/80"
      )}
      onClick={onClick}
    >
      <div className="space-y-3">
        {isPending && expiryUrgency.show && (
          <div className="flex items-center gap-2 rounded-md bg-amber-100 border border-amber-300/80 px-2.5 py-2 text-xs font-semibold text-amber-950">
            <Clock className="w-3.5 h-3.5 flex-shrink-0 text-amber-700" aria-hidden />
            <span>Răspunde în {expiryUrgency.label}</span>
          </div>
        )}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="font-semibold text-gray-900 truncate">{booking.locationName}</span>
              {isPending && (
                <span className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                  {pendingStatusLabel(booking.status)}
                </span>
              )}
            </div>
            <div className="mb-1">
              <span
                className={clsx(
                  'inline-block text-xs font-semibold px-2.5 py-1 rounded-md border',
                  isPending
                    ? 'bg-gray-100 text-gray-800 border-gray-200'
                    : 'bg-green-100 text-green-700 border-green-200'
                )}
              >
                {booking.eventName}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            {(isToday || isTomorrow) && (
              <span className={clsx(
                "text-xs font-semibold px-2 py-1 rounded-full",
                isToday && "bg-blue-100 text-blue-700",
                isTomorrow && "bg-orange-100 text-orange-700"
              )}>
                {isToday ? 'Today' : 'Tomorrow'}
              </span>
            )}
            {daysLabel && !isToday && !isTomorrow && (
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                {daysLabel}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
          <div className="flex items-start gap-2 text-sm">
            <Calendar className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="text-gray-600">
                <span className="font-medium text-gray-700">Check-in:</span>
                <div className="text-gray-800 mt-0.5">
                  {booking.checkIn ? formatDate(booking.checkIn) : '—'}
                </div>
              </div>
              <div className="text-gray-600">
                <span className="font-medium text-gray-700">Check-out:</span>
                <div className="text-gray-800 mt-0.5">
                  {booking.checkOut ? formatDate(booking.checkOut) : '—'}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <span><span className="font-medium text-gray-700">Guests:</span> {booking.guests}</span>
          </div>
          {isPending && booking.customerName && (
            <div className="text-sm text-gray-600">
              <span className="font-medium text-gray-700">Client:</span>{' '}
              <span className="text-gray-800">{booking.customerName}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ActiveEvents = ({ bookings, onBookingClick }: { bookings: Booking[]; onBookingClick: (bookingId: string) => void }) => {
  const navigate = useNavigate();

  const sortedBookings = [...bookings].sort((a, b) => {
    return new Date(a.checkIn).getTime() - new Date(b.checkIn).getTime();
  });

  const upcomingBookings = sortedBookings.slice(0, 5);

  return (
    <div className="h-full">
      <div className="flex items-center justify-between mb-6 ">
        <div className="flex items-center gap-2 gap-4">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Events</h2>
            <p className="text-xs text-gray-500 mt-0.5">Confirmed reservations</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/partner/bookings?status=confirmed')}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors hover:underline"
        >
          View All
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
              onClick={() => onBookingClick(String(booking.id))}
            />
          ))
        )}
      </div>
    </div>
  );
};

  const MiniBookingCalendar = ({ bookings, onDateClick }: { bookings: Booking[]; onDateClick: (date: Date) => void }) => {
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


const Dashboard = () => {
  const navigate = useNavigate();
  const { metrics, fetchMetrics, isLoadingMetrics } = useAdminStore();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDateEventsModal, setShowDateEventsModal] = useState(false);
  const [confirmedReservations, setConfirmedReservations] = useState<Booking[]>([]);
  const [pendingPreviewBookings, setPendingPreviewBookings] = useState<Booking[]>([]);
  const [isLoadingPendingPreview, setIsLoadingPendingPreview] = useState(true);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  const unreadMessagesCount = metrics.unreadMessages;
  const pendingBookingsCount = metrics.pendingBookings;
  const expiringHoldsCount = metrics.expiringHolds;

  const fetchConfirmedBookings = async () => {
    try {
      const { status, response } = await getBookings({ status: 'confirmed' });
      if (status === 200 && response?.data) {
        setConfirmedReservations(response.data);
      }
    } catch (error) {
      console.error('Error fetching confirmed bookings:', error);
    }
  };

  const fetchPendingPreviewBookings = async (silent = false) => {
    try {
      if (!silent) setIsLoadingPendingPreview(true);
      const { status, response } = await getBookings({
        status: 'pending',
        pageSize: 3,
        pageNumber: 1,
      });
      if (status === 200 && response?.data) {
        const list = Array.isArray(response.data) ? response.data : [];
        const sorted = [...list].sort(
          (a, b) =>
            new Date(a.checkIn || 0).getTime() - new Date(b.checkIn || 0).getTime()
        );
        setPendingPreviewBookings(sorted);
      }
    } catch (error) {
      console.error('Error fetching pending bookings:', error);
    } finally {
      if (!silent) setIsLoadingPendingPreview(false);
    }
  };

  useEffect(() => {
    fetchConfirmedBookings();
    fetchPendingPreviewBookings();
  }, []);

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setShowDateEventsModal(true);
  };

  const getEventsForDate = (date: Date): Booking[] => {
    const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    return confirmedReservations.filter((booking: Booking) => {
      const bookingDate = new Date(booking.checkIn);
      const bookingKey = `${bookingDate.getFullYear()}-${bookingDate.getMonth()}-${bookingDate.getDate()}`;
      return bookingKey === dateKey;
    });
  };

  const handleBookingClick = (bookingId: string) => {
    setSelectedBookingId(bookingId);
    setIsBookingModalOpen(true);
  };

  const handleCloseBookingModal = () => {
    setIsBookingModalOpen(false);
    setSelectedBookingId(null);
    fetchPendingPreviewBookings(true);
  };

  const hasPriorityOperations = pendingBookingsCount > 0 || expiringHoldsCount > 0 || unreadMessagesCount > 0;

  // Show warning if no locations exist
  if (!isLoadingMetrics && metrics.totalProperties === 0) {
    return (
      <div className="w-full space-y-6">
        <div className="rounded-xl border-2 p-6 flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-900 mb-2">
                Locație necesară
              </h3>
              <p className="text-sm text-yellow-800 mb-4">
                Pentru a primi rezervări și a folosi aplicația, trebuie să adaugi cel puțin o locație
              </p>
              <button
                onClick={() => navigate('/partner/properties')}
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2 text-sm"
              >
                <Building2 className="w-4 h-4" />
                <span>Adaugă locație</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 pt-2">
   

      {hasPriorityOperations && (
        <div className="rounded-xl border border-blue-100 p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-4 flex-1">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-base mb-1">
                  Priority Operations Required
                </h3>
                <p className="text-sm text-gray-700">
                  You have <strong>{pendingBookingsCount} pending pre-bookings</strong>
                  {expiringHoldsCount > 0 && `, ${expiringHoldsCount} expiring hold${expiringHoldsCount === 1 ? '' : 's'}`}
                  {unreadMessagesCount > 0 && `, and ${unreadMessagesCount} unread message${unreadMessagesCount === 1 ? '' : 's'}`}
                  {' '}needing attention.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              {(pendingBookingsCount > 0 || expiringHoldsCount > 0) && (
                <button
                  onClick={() => navigate('/partner/bookings/manage')}
                  className="btn btn-outline"
                >
                  Review Pending
                </button>
              )}
            </div>
          </div>
        </div>
      )}



      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 flex flex-col gap-6">
          <div className="h-full">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 gap-4">
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Pending bookings</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Pre-booking requests awaiting review</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate('/partner/bookings/manage')}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors hover:underline"
              >
                View All
              </button>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
              {isLoadingPendingPreview ? (
                <div className="space-y-3">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="h-16 rounded-lg border border-gray-200 bg-white/80 animate-pulse"
                    />
                  ))}
                </div>
              ) : pendingPreviewBookings.length === 0 ? (
                <div className="text-center py-12">
                  <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">
                    No pending pre-bookings. New requests will appear here.
                  </p>
                </div>
              ) : (
                pendingPreviewBookings.map((booking, index) => (
                  <EventCard
                    key={`${booking.id}-${index}`}
                    booking={booking}
                    variant="pending"
                    compact
                    onClick={() => handleBookingClick(String(booking.id))}
                  />
                ))
              )}
            </div>
          </div>

          <ActiveEvents bookings={confirmedReservations} onBookingClick={handleBookingClick} />
        </div>

        <div className="lg:col-span-2">
          <MiniBookingCalendar bookings={confirmedReservations} onDateClick={handleDateClick} />
        </div>
      </div>

      <CustomModal
        open={showDateEventsModal}
        onClose={() => {
          setShowDateEventsModal(false);
          setSelectedDate(null);
        }}
        title={selectedDate ? `Events on ${formatDate(selectedDate)}` : 'Events'}
      >
        {selectedDate && (
          <div className="space-y-4">
            {getEventsForDate(selectedDate).length === 0 ? (
              <p className="text-gray-500 text-center py-4">No events scheduled for this date.</p>
            ) : (
              getEventsForDate(selectedDate).map((booking: Booking, index: number) => (
                <EventCard
                  key={index}
                  booking={booking}
                  onClick={() => handleBookingClick(String(booking.id))}
                />
              ))
            )}
          </div>
        )}
      </CustomModal>

      <CustomModal
        open={isBookingModalOpen}
        onClose={handleCloseBookingModal}
        title={selectedBookingId ? `Booking Details` : 'Booking Details'}
        className="relative bg-white rounded-xl h-[90vh] w-[75vw] flex flex-col overflow-hidden"
      >
        {selectedBookingId && (
          <Overview bookingId={selectedBookingId} />
        )}
      </CustomModal>
    </div>
  );
};

export default Dashboard;
