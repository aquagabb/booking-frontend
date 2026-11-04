import { useNavigate, useParams } from 'react-router-dom';
import { AlertCircle, Bell, LayoutDashboard } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
import LocationSetupDashboard from './LocationSetupDashboard';
import type { Booking } from './types';

type TabType = 'overview' | 'reminders';
const validTabs: TabType[] = ['overview', 'reminders'];

const Dashboard = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { tab } = useParams<{ tab?: string }>();
  const activeTab: TabType = tab && validTabs.includes(tab as TabType) ? (tab as TabType) : 'overview';
  const { metrics, fetchMetrics } = useAdminStore();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDateEventsModal, setShowDateEventsModal] = useState(false);
  const [confirmedReservations, setConfirmedReservations] = useState<Booking[]>([]);
  const [isLoadingConfirmed, setIsLoadingConfirmed] = useState(true);
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
    } finally {
      setIsLoadingConfirmed(false);
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

  // Fără rezervări în așteptare și fără evenimente viitoare → dashboard-ul de configurare a locației
  const hasNoActiveBookings =
    !isLoadingPendingPreview &&
    !isLoadingConfirmed &&
    pendingPreviewBookings.length === 0 &&
    confirmedReservations.length === 0;

  const hasPriorityOperations =pendingBookingsCount > 0 || expiringHoldsCount > 0 || unreadMessagesCount > 0;

  // Notă: cazul "nicio locație" e tratat global în AdminLayout (blochează toată aplicația
  // și redirecționează spre wizard-ul de onboarding) — Dashboard-ul nu mai are nevoie de
  // propriul early-return pentru asta.

  return (
    <div className="w-full space-y-6">
      <div className="flex gap-3 sm:gap-4 lg:gap-5 border-b border-gray-200 pb-1.5">
        {(
          [
            { key: 'overview', label: t('dashboard.tab_overview'), icon: LayoutDashboard },
            { key: 'reminders', label: t('dashboard.tab_reminders'), icon: Bell },
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

      {activeTab === 'overview' && hasNoActiveBookings && <LocationSetupDashboard />}

      {activeTab === 'overview' && !hasNoActiveBookings && (
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
                  {t('dashboard.priority_title')}
                </h3>
                <p className="text-sm text-gray-700">
                  {t('dashboard.priority_you_have')} <strong>{t('dashboard.priority_pending', { count: pendingBookingsCount })}</strong>
                  {expiringHoldsCount > 0 && `, ${t('dashboard.priority_holds', { count: expiringHoldsCount })}`}
                  {unreadMessagesCount > 0 && `, ${t('dashboard.priority_and')} ${t('dashboard.priority_messages', { count: unreadMessagesCount })}`}
                  {' '}{t('dashboard.priority_needing_attention')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              {(pendingBookingsCount > 0 || expiringHoldsCount > 0) && (
                <button
                  onClick={() => navigate('/partner/bookings/manage')}
                  className="btn btn-outline"
                >
                  {t('dashboard.review_pending')}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {!isLoadingPendingPreview && !isLoadingConfirmed && (
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
      )}
        </>
      )}

      <CustomModal
        open={showDateEventsModal}
        onClose={() => {
          setShowDateEventsModal(false);
          setSelectedDate(null);
        }}
        title={selectedDate ? t('dashboard.events_on', { date: formatDate(selectedDate) }) : t('dashboard.events')}
      >
        {selectedDate && (
          <div className="space-y-4">
            {getEventsForDate(selectedDate).length === 0 ? (
              <p className="text-gray-500 text-center py-4">{t('dashboard.no_events_for_date')}</p>
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
        title={t('dashboard.booking_details')}
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
