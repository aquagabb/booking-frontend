import React, { useMemo } from 'react';
import { MapPin, Calendar, Clock, Users, Timer } from 'lucide-react';
import { formatDate } from '../../../../lib/utils';
import type { ReservationDetailsProps } from './types';

const ReservationDetails: React.FC<ReservationDetailsProps> = ({ item }) => {
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
        return `${duration.days} day${duration.days > 1 ? 's' : ''} ${duration.remainingHours} hour${duration.remainingHours > 1 ? 's' : ''}`;
      }
      return `${duration.days} day${duration.days > 1 ? 's' : ''}`;
    }
    return `${duration.hours} hour${duration.hours > 1 ? 's' : ''}`;
  };

  return (
    <div className="">
      <h2 className="text-base font-semibold text-gray-900 mb-4">Reservation Details</h2>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <MapPin className="w-5 h-5 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">Location</p>
            <p className="text-sm font-medium text-gray-900">{item.locationName}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">Event Type</p>
            <p className="text-sm font-medium text-gray-900">{item.eventName}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">Check-in</p>
            <p className="text-sm font-medium text-gray-900">
              {formatDate(item.checkIn)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">Check-out</p>
            <p className="text-sm font-medium text-gray-900">
              {formatDate(item.checkOut)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Timer className="w-5 h-5 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">Duration</p>
            <p className="text-sm font-medium text-gray-900">
              {formatDuration()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Users className="w-5 h-5 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">Guests</p>
            <p className="text-sm font-medium text-gray-900">{item.guests} guests</p>
          </div>
        </div>
        {item.additionalInfo?.trim() && (
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Observații</h3>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{item.additionalInfo.trim()}</p>
          </div>
        )}
        {item.createdAt && (
          <div className="border-t border-gray-200 pt-4">
            <p className="text-sm text-gray-500">
              Created on {formatDate(item.createdAt)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReservationDetails;