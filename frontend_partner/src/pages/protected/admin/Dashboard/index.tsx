import { useNavigate, useParams } from 'react-router-dom';
import { AlertCircle, AlertTriangle, Bell, Building2, ChevronRight, LayoutDashboard } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAdminStore } from '../../../../store/admin.store';
import CustomModal from '../../../../components/shared/Modals/CustomModal';
import { getBookings } from '../../../../api/bookings/bookings';
import { formatDate } from '../../../../lib/utils';
import Overview from '../Bookings/Overview';
import EventCard from './EventCard';
import PendingBookings from './PendingBookings';
import UpcomingEvents from './UpcomingEvents';
import BookingCalendar from './BookingCalendar';
import KpiOverview from './KpiOverview';
import { IncompleteLocations } from './AttentionNeeded';
import Reminders from './Reminders';
import type { Booking } from './types';

type TabType = 'overview' | 'reminders';
const validTabs: TabType[] = ['overview', 'reminders'];

const Dashboard = () => {
  const navigate = useNavigate();
  const { tab } = useParams<{ tab?: string }>();
  const activeTab: TabType = tab && validTabs.includes(tab as TabType) ? (tab as TabType) : 'overview';
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
    <div className="w-full space-y-6">
      <div className="flex gap-3 sm:gap-4 lg:gap-5 border-b border-gray-200 pb-1.5">
        {(
          [
            { key: 'overview', label: 'Overview', icon: LayoutDashboard },
            { key: 'reminders', label: 'Remindere', icon: Bell },
          ] as const
        ).map((tabItem) => (
          <button
            key={tabItem.key}
            onClick={() => navigate(`/partner/dashboard/${tabItem.key}`)}
            className={`relative py-1.5 px-1 sm:px-2 text-sm font-medium flex items-center gap-1.5 transition-colors ${
              activeTab === tabItem.key
                ? 'text-primary'
                : 'text-gray-600 hover:text-primary'
            }`}
          >
            <tabItem.icon className="w-4 h-4" />
            <span>{tabItem.label}</span>
            {activeTab === tabItem.key && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full" />
            )}
          </button>
        ))}
      </div>

      {activeTab === 'reminders' && <Reminders />}

      {activeTab === 'overview' && (
        <>
      <KpiOverview />

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

      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        <div className="lg:col-span-7 flex flex-col gap-6">
          <IncompleteLocations />

          <PendingBookings
            bookings={pendingPreviewBookings}
            isLoading={isLoadingPendingPreview}
            onBookingClick={handleBookingClick}
          />

          <UpcomingEvents bookings={confirmedReservations} onBookingClick={handleBookingClick} />
        </div>

        <div className="lg:col-span-3">
          <Reminders limit={3} />
        </div>
      </div>
        </>
      )}

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
                  variant="confirmed"
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
