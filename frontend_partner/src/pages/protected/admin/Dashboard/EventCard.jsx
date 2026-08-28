import clsx from 'clsx';
import { ArrowRight, Calendar, Clock, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatDateRomanian, formatDuration, getPendingExpiryUrgency } from '../../../../lib/utils';
import { getCurrentDate } from './utils';

const TONE_CLASSES = {
  primary: 'bg-primary text-background',
  accent: 'bg-accent text-background',
  muted: 'bg-gray-custom text-secondary',
};

const PendingEventCard = ({ booking, onClick, eventCategoryLabel }) => {
  const durationLabel = formatDuration(booking.checkIn, booking.checkOut);
  const totalPrice = Number(booking.totalPrice) || 0;
  const expiryUrgency = getPendingExpiryUrgency(
    booking.expiresAt || booking.pendingConfirmationExpiresAt || booking.expirationDate
  );

  return (
    <div
      className={clsx(
        'border rounded-lg px-4 py-3 flex flex-col gap-2 transition-colors border-[var(--color-gray)]',
        onClick && 'cursor-pointer hover:border-[var(--color-primary)]',
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-1.5 text-sm flex-wrap min-w-0">
        <span className="font-semibold text-secondary truncate">{booking.locationName}</span>
        <span className="text-secondary">•</span>
        <span className="text-secondary truncate">{eventCategoryLabel}</span>
        {booking.customerName && (
          <>
            <span className="text-secondary">•</span>
            <span className="text-secondary truncate">{booking.customerName}</span>
          </>
        )}
      </div>

      <div className="flex items-center gap-x-4 gap-y-1 text-sm text-secondary flex-wrap">
        <span className="flex items-center gap-1.5 whitespace-nowrap">
          <Calendar className="w-3.5 h-3.5 flex-shrink-0" aria-hidden />
          {booking.checkIn ? formatDateRomanian(booking.checkIn, true) : '—'}
        </span>
        {durationLabel && (
          <span className="flex items-center gap-1.5 whitespace-nowrap">
            <Clock className="w-3.5 h-3.5 flex-shrink-0" aria-hidden />
            {durationLabel}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 pt-2 mt-0.5 border-t border-[var(--color-gray)]">
        <div className="flex items-center gap-1.5 text-xs text-secondary flex-wrap">
          <Users className="w-3.5 h-3.5 flex-shrink-0" aria-hidden />
          <span>{booking.guests} persoane</span>
          {totalPrice > 0 && (
            <>
              <span>•</span>
              <span className="text-sm font-semibold">{totalPrice.toLocaleString('ro-RO')} lei</span>
            </>
          )}
        </div>
        {expiryUrgency.show && (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-accent flex-shrink-0 whitespace-nowrap">
            <Clock className="w-3.5 h-3.5 flex-shrink-0" aria-hidden />
            Răspunde în {expiryUrgency.label}
          </span>
        )}
      </div>
    </div>
  );
};

const ConfirmedEventCard = ({ booking, onClick, eventCategoryLabel }) => {
  const currentDate = getCurrentDate();
  const checkInDate = booking.checkIn ? new Date(booking.checkIn) : null;
  const checkOutDate = booking.checkOut ? new Date(booking.checkOut) : null;

  const isOngoing =
    checkInDate !== null &&
    checkOutDate !== null &&
    currentDate >= checkInDate &&
    currentDate <= checkOutDate;
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

  const getTimeUntilLabel = () => {
    if (isOngoing) return 'În desfășurare';
    if (isToday) return 'Astăzi';
    if (isTomorrow) return 'Mâine';
    if (checkInDate === null || daysUntilEvent <= 0) return null;

    if (daysUntilEvent <= 30) {
      return `Peste ${daysUntilEvent} ${daysUntilEvent === 1 ? 'zi' : 'zile'}`;
    }

    const monthsUntilEvent =
      (checkInDate.getFullYear() - currentDate.getFullYear()) * 12 +
      (checkInDate.getMonth() - currentDate.getMonth());

    if (monthsUntilEvent <= 0) return null;

    return monthsUntilEvent === 1 ? 'Peste o lună' : `Peste ${monthsUntilEvent} luni`;
  };

  const timeUntilLabel = getTimeUntilLabel();
  const timeUntilTone = isOngoing || isToday ? 'primary' : isTomorrow ? 'accent' : 'muted';
  const durationLabel = formatDuration(booking.checkIn, booking.checkOut);

  return (
    <div
      className={clsx(
        'border rounded-lg px-4 py-3 flex flex-col gap-2 transition-colors',
        isOngoing ? 'border-[var(--color-primary)]' : 'border-[var(--color-gray)]',
        onClick && 'cursor-pointer hover:border-[var(--color-primary)]',
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 text-sm flex-wrap min-w-0">
          <span className="font-semibold text-secondary truncate">{booking.locationName}</span>
          <span className="text-secondary">•</span>
          <span className="text-secondary truncate">{eventCategoryLabel}</span>
          {booking.customerName && (
            <>
              <span className="text-secondary">•</span>
              <span className="text-secondary truncate">{booking.customerName}</span>
            </>
          )}
        </div>
        {timeUntilLabel && (
          <span
            className={clsx(
              'text-[11px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 whitespace-nowrap',
              TONE_CLASSES[timeUntilTone],
            )}
          >
            {timeUntilLabel}
          </span>
        )}
      </div>

      <div className="flex items-center gap-x-4 gap-y-1 text-sm text-secondary flex-wrap">
        <span className="flex items-center gap-1.5 whitespace-nowrap">
          <Calendar className="w-3.5 h-3.5 flex-shrink-0" aria-hidden />
          {booking.checkIn ? formatDateRomanian(booking.checkIn, true) : '—'}
        </span>
        <span className="flex items-center gap-1.5 whitespace-nowrap">
          <ArrowRight className="w-3.5 h-3.5 flex-shrink-0" aria-hidden />
          {booking.checkOut ? formatDateRomanian(booking.checkOut, true) : '—'}
        </span>
      </div>

      {durationLabel && (
        <div className="flex items-center gap-1.5 text-sm font-medium text-primary">
          <Clock className="w-3.5 h-3.5 flex-shrink-0" aria-hidden />
          <span>Evenimentul durează {durationLabel}</span>
        </div>
      )}

      <div className="flex items-center gap-1.5 text-xs text-secondary flex-wrap pt-2 mt-0.5 border-t border-[var(--color-gray)]">
        <Users className="w-3.5 h-3.5 flex-shrink-0" aria-hidden />
        <span>{booking.guests} persoane</span>
      </div>
    </div>
  );
};

const EventCard = ({ booking, onClick, variant = 'confirmed' }) => {
  const { t } = useTranslation();
  const eventCategoryKey = booking.eventName?.trim().toLowerCase().replace(/\s+/g, '_');
  const eventCategoryLabel = eventCategoryKey
    ? t(`event_categories.${eventCategoryKey}`, booking.eventName)
    : booking.eventName;

  if (variant === 'pending') {
    return <PendingEventCard booking={booking} onClick={onClick} eventCategoryLabel={eventCategoryLabel} />;
  }

  return <ConfirmedEventCard booking={booking} onClick={onClick} eventCategoryLabel={eventCategoryLabel} />;
};

export default EventCard;
