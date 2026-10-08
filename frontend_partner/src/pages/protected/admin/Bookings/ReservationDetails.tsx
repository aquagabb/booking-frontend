import React, { useMemo } from 'react';
import { MapPin, Calendar, Clock, Users, Timer, LayoutGrid, Edit2 } from 'lucide-react';
import { formatDateTimeRo, withFallback, capitalize } from '../../../../lib/utils';
import type { ReservationDetailsProps } from './types';

const ReservationDetails: React.FC<ReservationDetailsProps> = ({ item, onEdit }) => {
  const duration = useMemo(() => {
    const checkIn = new Date(item.checkIn);
    const checkOut = new Date(item.checkOut);
    const diffMs = checkOut.getTime() - checkIn.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    const remainingHours = diffHours % 24;

    return {
      hours: diffHours,
      days: diffDays,
      remainingHours,
    };
  }, [item.checkIn, item.checkOut]);

  const formatDuration = () => {
    if (duration.days > 0) {
      if (duration.remainingHours > 0) {
        return `${duration.days} ${duration.days > 1 ? 'zile' : 'zi'} ${duration.remainingHours} ${duration.remainingHours > 1 ? 'ore' : 'oră'}`;
      }
      return `${duration.days} ${duration.days > 1 ? 'zile' : 'zi'}`;
    }
    return `${duration.hours} ${duration.hours > 1 ? 'ore' : 'oră'}`;
  };

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900">1. Detalii Rezervare</h2>
          <p className="text-xs text-gray-500 mt-0.5">ID: {item.code}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {onEdit && (
            <button
              onClick={onEdit}
              className="btn-outline flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm"
            >
              <Edit2 className="w-4 h-4" />
              Editare
            </button>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex items-center gap-3">
          <MapPin className="w-5 h-5 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">Locație</p>
            <p className="text-sm font-medium text-gray-900">{withFallback(item.locationName)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">Tip Eveniment</p>
            <p className="text-sm font-medium text-gray-900">{withFallback(item.eventName)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">Check-in</p>
            <p className="text-sm font-medium text-gray-900">
              {formatDateTimeRo(item.checkIn)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">Check-out</p>
            <p className="text-sm font-medium text-gray-900">
              {formatDateTimeRo(item.checkOut)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Timer className="w-5 h-5 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">Durată</p>
            <p className="text-sm font-medium text-gray-900">
              {formatDuration()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Users className="w-5 h-5 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">Număr Oaspeți</p>
            <p className="text-sm font-medium text-gray-900">
              {item.guests ? `${item.guests} oaspeți` : '-'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <LayoutGrid className="w-5 h-5 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">Tip așezare</p>
            <p className="text-sm font-medium text-gray-900">
              {item.seatingPlanName ? capitalize(item.seatingPlanName) : '-'}
            </p>
          </div>
        </div>
      </div>
      {item.additionalInfo?.trim() && (
        <div className="border-t border-[var(--color-gray)] mt-4 pt-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Observații</h3>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{item.additionalInfo.trim()}</p>
        </div>
      )}
      {item.createdAt && (
        <div className="border-t border-[var(--color-gray)] mt-4 pt-3 flex items-center justify-between text-xs text-gray-500">
          <span>Rezervarea a fost făcută pe {formatDateTimeRo(item.createdAt)}</span>
        </div>
      )}
    </div>
  );
};

export default ReservationDetails;
