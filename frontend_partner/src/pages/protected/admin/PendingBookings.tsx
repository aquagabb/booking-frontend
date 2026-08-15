import React, { useState, useMemo, useEffect } from 'react';
import {
  Globe,
  Calendar,
  Users,
  Plus,
  Clock,
} from 'lucide-react';
import clsx from 'clsx';
import CustomSelect from '../../../components/shared/CustomSelect';
import { getBookings, updateBookingStatus } from '../../../api/bookings/bookings';
import CustomModal from '../../../components/shared/Modals/CustomModal';
import Overview from './Bookings/Overview';
import { formatDate, getPendingExpiryUrgency } from '../../../lib/utils';
import type { BookingDetails } from './Bookings/types';

type BookingStatus = 'new' | 'quoting' | 'hold';

type BookingSource = 'website' | 'custom';

interface PendingBooking {
  id: string;
  clientName: string;
  eventName: string;
  eventDate: string;
  venue: string;
  venueSpace: string;
  estimatedValue: string;
  source: BookingSource;
  expirationDate: string;
  status: BookingStatus;
  assignedTo?: string;
  proposalSentDate?: string;
  holdUntilDate?: string;
  code?: string;
  locationId?: number;
  locationName?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  totalPrice?: number;
  basePrice?: number;
  createdAt?: string;
  /** Set only when API sends a real deadline (not a synthetic fallback). */
  expiresAt?: string;
}

const getCurrentDate = () => new Date();

const STATUS_COLUMNS: { key: BookingStatus; label: string; color: string; dotColor: string; headerBg: string; headerBorder: string }[] = [
  { key: 'new', label: 'Asteapta confirmare', color: 'bg-blue-50', dotColor: 'bg-blue-500', headerBg: 'bg-blue-50/50', headerBorder: 'border-blue-200' },
  { key: 'quoting', label: 'In ofertare', color: 'bg-orange-50', dotColor: 'bg-orange-500', headerBg: 'bg-orange-50/50', headerBorder: 'border-orange-200' },
  { key: 'hold', label: 'In asteptare / blocat', color: 'bg-purple-50', dotColor: 'bg-purple-500', headerBg: 'bg-purple-50/50', headerBorder: 'border-purple-200' }
];

const PendingBookingCard = ({ 
  booking, 
  onClick 
}: { 
  booking: PendingBooking; 
  onClick?: () => void;
}) => {
  if (!booking.checkIn) return null;

  const checkInDate = new Date(booking.checkIn);
  const currentDate = getCurrentDate();
  const isToday = checkInDate.toDateString() === currentDate.toDateString();
  const isTomorrow = checkInDate.toDateString() === new Date(currentDate.getTime() + 24 * 60 * 60 * 1000).toDateString();
  
  const daysUntilEvent = Math.ceil((checkInDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
  
  const isNextMonth = (checkInDate.getMonth() !== currentDate.getMonth() || 
                       checkInDate.getFullYear() !== currentDate.getFullYear()) &&
                      daysUntilEvent > 0;
  
  const getDaysLabel = () => {
    if (isNextMonth) {
      return 'luna următoare';
    } else if (daysUntilEvent > 0 && daysUntilEvent <= 30 && !isToday && !isTomorrow) {
      return `in ${daysUntilEvent} de zile`;
    }
    return null;
  };
  
  const daysLabel = getDaysLabel();

  const statusMeta = STATUS_COLUMNS.find((c) => c.key === booking.status);
  const expiryUrgency = getPendingExpiryUrgency(booking.expiresAt);

  const estimatedValue = booking.totalPrice
    ? `€${booking.totalPrice.toLocaleString()}`
    : booking.basePrice
      ? `€${booking.basePrice.toLocaleString()}`
      : 'N/A';

  return (
    <div
      className={clsx(
        "border border-gray-300 rounded-lg p-5 hover:shadow-md transition-all bg-white",
        onClick && "cursor-pointer",
        isToday && "border-blue-400 bg-blue-50/30",
        expiryUrgency.show && "border-amber-400 bg-amber-50/30 ring-1 ring-amber-200/80"
      )}
      onClick={onClick}
    >
      <div className="space-y-3">
        {expiryUrgency.show && (
          <div className="flex items-center gap-2 rounded-md bg-amber-100 border border-amber-300/80 px-2.5 py-2 text-xs font-semibold text-amber-950">
            <Clock className="w-3.5 h-3.5 flex-shrink-0 text-amber-700" aria-hidden />
            <span>Răspunde în {expiryUrgency.label}</span>
          </div>
        )}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="font-semibold text-base text-gray-900 truncate">{booking.locationName || booking.venue || 'N/A'}</span>
              {statusMeta && (
                <span
                  className={clsx(
                    'text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full border shrink-0',
                    statusMeta.key === 'new' && 'bg-blue-50 text-blue-800 border-blue-200',
                    statusMeta.key === 'quoting' && 'bg-orange-50 text-orange-800 border-orange-200',
                    statusMeta.key === 'hold' && 'bg-purple-50 text-purple-800 border-purple-200'
                  )}
                >
                  {statusMeta.label}
                </span>
              )}
            </div>
            <div className="mb-1">
              <span className={clsx(
                "inline-block text-xs font-semibold px-2.5 py-1 rounded-md border bg-green-100 text-green-700 border-green-200",
              )}>
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

        <div className="flex flex-col gap-2 pt-2 border-t border-gray-200">
          {booking.checkIn && booking.checkOut && (
            <div className="flex items-start gap-2 text-sm">
              <Calendar className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="text-gray-600">
                  <span className="font-medium text-gray-700">Check-in:</span>
                  <div className="text-gray-800 mt-0.5">{formatDate(booking.checkIn)}</div>
                </div>
                <div className="text-gray-600">
                  <span className="font-medium text-gray-700">Check-out:</span>
                  <div className="text-gray-800 mt-0.5">{formatDate(booking.checkOut)}</div>
                </div>
              </div>
            </div>
          )}
          
          {booking.guests && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <span><span className="font-medium text-gray-700">Guests:</span> {booking.guests}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-gray-200">
            <span className="font-semibold text-gray-900">{estimatedValue}</span>
            {booking.source === 'website' && (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-blue-50 border border-blue-200">
                <Globe className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-xs font-medium text-blue-700">Website</span>
              </div>
            )}
          </div>
        </div>

        {booking.status === 'quoting' && booking.proposalSentDate && (
          <div className="pt-2 border-t border-gray-200 text-xs text-orange-600">
            Proposal sent: {Math.floor((Date.now() - new Date(booking.proposalSentDate).getTime()) / (1000 * 60 * 60 * 24))} days ago
          </div>
        )}

        {booking.status === 'hold' && booking.holdUntilDate && (
          <div className="pt-2 border-t border-gray-200 text-xs text-gray-600 font-medium">
            HOLD UNTIL {new Date(booking.holdUntilDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()}
          </div>
        )}
      </div>
    </div>
  );
};

const PendingBookings: React.FC = () => {
  const [bookings, setBookings] = useState<PendingBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [location, setLocation] = useState<string>('all');
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);


  const mapBackendStatusToFrontend = (backendStatus: string): BookingStatus => {
    switch (backendStatus) {
      case 'awaiting_client':
        return 'quoting';
      case 'on_hold':
        return 'hold';
      case 'pending':
      default:
        return 'new';
    }
  };

  const mapFrontendStatusToBackend = (frontendStatus: BookingStatus): string => {
    switch (frontendStatus) {
      case 'quoting':
        return 'awaiting_client';
      case 'hold':
        return 'on_hold';
      case 'new':
      default:
        return 'pending';
    }
  };

  const mapBackendToPendingBooking = (booking: BookingDetails | any): PendingBooking => {
    const status = mapBackendStatusToFrontend(booking.status || 'pending');

    const eventDate = booking.checkIn
      ? formatDate(booking.checkIn).split(',')[0]
      : '';

    const estimatedValue = booking.totalPrice
      ? `€${booking.totalPrice.toLocaleString()}`
      : booking.basePrice
        ? `€${booking.basePrice.toLocaleString()}`
        : 'N/A';

    const source: BookingSource = booking.source === 'custom' ? 'custom' : 'website';

    const resolvedExpiresAt =
      booking.expiresAt ||
      booking.pendingConfirmationExpiresAt ||
      booking.expirationDate ||
      undefined;

    const expirationDate =
      resolvedExpiresAt ||
      (booking.createdAt
        ? new Date(new Date(booking.createdAt).getTime() + 24 * 60 * 60 * 1000).toISOString()
        : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString());

    return {
      id: booking.id,
      code: booking.code,
      clientName: booking.customerName || '',
      eventName: booking.eventName || '',
      eventDate,
      venue: booking.locationName || '',
      venueSpace: booking.locationName || '',
      estimatedValue,
      source,
      expirationDate,
      status,
      assignedTo: booking.assignedTo,
      proposalSentDate: booking.proposalSentDate || booking.proposalSentAt,
      holdUntilDate: booking.holdUntilDate || booking.holdUntil,
      locationId: booking.locationId,
      locationName: booking.locationName,
      customerName: booking.customerName,
      customerEmail: booking.customerEmail,
      customerPhone: booking.customerPhone,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      guests: booking.guests,
      totalPrice: booking.totalPrice,
      basePrice: booking.basePrice,
      createdAt: booking.createdAt,
      expiresAt: resolvedExpiresAt,
    };
  };

  const fetchPendingBookings = async () => {
    try {
      setLoading(true);
      const { status, response } = await getBookings({ status: 'pending_bookings_admin' });
      if (status === 200 && response?.data) {
        const bookingsData = Array.isArray(response.data) ? response.data : [];
        const mappedBookings = bookingsData.map(mapBackendToPendingBooking);
        setBookings(mappedBookings);
      }
    } catch (error) {
      console.error('Error fetching pending bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingBookings();
  }, []);

  const handleDragStart = (e: React.DragEvent, bookingId: string) => {
    setDraggedItem(bookingId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: BookingStatus) => {
    e.preventDefault();

    if (!draggedItem) return;

    const booking = bookings.find(b => b.id === draggedItem);
    if (!booking) return;

    if (booking.status === targetStatus) {
      setDraggedItem(null);
      return;
    }

    setBookings((prev) =>
      prev.map((b) =>
        b.id === draggedItem ? { ...b, status: targetStatus } : b
      )
    );

    setDraggedItem(null);

    try {
      const backendStatus = mapFrontendStatusToBackend(targetStatus);
      const bookingId = parseInt(booking.id, 10);

      if (isNaN(bookingId)) {
        console.error('Invalid booking ID:', booking.id);
        setBookings((prev) =>
          prev.map((b) =>
            b.id === booking.id ? { ...b, status: booking.status } : b
          )
        );
        return;
      }

      const { status } = await updateBookingStatus({
        status: backendStatus,
        bookingId: bookingId,
      });

      if (status !== 200 && status !== 201) {
        setBookings((prev) =>
          prev.map((b) =>
            b.id === booking.id ? { ...b, status: booking.status } : b
          )
        );
        console.error('Failed to update booking status');
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
      setBookings((prev) =>
        prev.map((b) =>
          b.id === booking.id ? { ...b, status: booking.status } : b
        )
      );
    }
  };

  const handleCardClick = (bookingId: string) => {
    setSelectedBookingId(bookingId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBookingId(null);
  };

  const locationOptions = useMemo(() => {
    const locationsMap = new Map<number, string>();
    
    bookings
      .filter((booking) => booking.source === 'website' && booking.locationId && booking.locationName)
      .forEach((booking) => {
        if (booking.locationId && booking.locationName) {
          locationsMap.set(booking.locationId, booking.locationName);
        }
      });

    const locationOptionsArray = Array.from(locationsMap.entries())
      .map(([id, name]) => ({
        value: id.toString(),
        label: name,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));

    return [
      { value: 'all', label: 'All Locations' },
      ...locationOptionsArray,
    ];
  }, [bookings]);

  const groupedBookings = useMemo(() => {
    const grouped: Record<BookingStatus, PendingBooking[]> = {
      new: [],
      quoting: [],
      hold: [],
    };

    bookings
      .filter((booking) => {
        if (booking.source !== 'website') return false;
        
        if (location !== 'all' && booking.locationId) {
          return booking.locationId.toString() === location;
        }
        
        return true;
      })
      .forEach((booking) => {
        if (booking.status in grouped) {
          grouped[booking.status].push(booking);
        }
      });

    return grouped;
  }, [bookings, location]);

  return (
    <div className="flex flex-col bg-gray-50" style={{ height: 'calc(100vh - 1rem)' }}>
      <div className="bg-white pb-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Locations:</span>
              <CustomSelect
                value={{ value: location, label: locationOptions.find((opt) => opt.value === location)?.label || '' }}
                onChange={(option) => setLocation(option?.value as string || 'all')}
                options={locationOptions}
                placeholder="Select"
                isSearchable={false}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Loading pending bookings...</p>
          </div>
        ) : (
          <div className="flex gap-6 p-6 h-full min-w-max">
            {STATUS_COLUMNS.map((column) => {
              const columnBookings = groupedBookings[column.key];

              return (
                <div
                  key={column.key}
                  className="flex flex-col w-96 bg-white rounded-lg border border-gray-200 flex-shrink-0 shadow-sm"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, column.key)}
                >
                  <div className={`flex items-center justify-between px-4 py-3 ${column.headerBg} border-b ${column.headerBorder} flex-shrink-0 rounded-t-lg`}>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${column.dotColor}`} />
                      <h3 className="text-sm font-semibold text-gray-900 tracking-wide">{column.label}</h3>
                      {columnBookings.length > 0 && (
                        <span className="text-sm text-gray-500 font-normal">({columnBookings.length})</span>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[200px]">
                    {columnBookings.map((booking) => (
                      <div
                        key={booking.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, booking.id)}
                        className="cursor-pointer"
                      >
                        <PendingBookingCard
                          booking={booking}
                          onClick={() => handleCardClick(booking.id)}
                        />
                      </div>
                    ))}

                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                      <Plus className="w-5 h-5 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500 font-medium">DROP HERE</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <CustomModal
        open={isModalOpen}
        onClose={handleCloseModal}
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

export default PendingBookings;
