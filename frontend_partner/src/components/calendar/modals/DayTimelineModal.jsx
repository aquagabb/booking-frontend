import moment from "moment";
import { Dialog } from "@headlessui/react";
import { CalendarIcon, Clock, Info, Lock, Plus, Users, X } from "lucide-react";
import { formatDate } from "../calendarHelpers";

const DayTimelineModal = ({
  open,
  onClose,
  date,
  dayEvents,
  scheduleHint,
  onSelectBlockedEvent,
  onSelectBooking,
  onAddEvent,
  onBlockDay,
}) => {
  const visibleEvents = (dayEvents || [])
    .filter((event) => !event.isScheduleClosed)
    .sort((a, b) => moment(a.start).valueOf() - moment(b.start).valueOf());

  return (
    <Dialog open={open} onClose={onClose} className="relative z-40">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-lg rounded-lg bg-white dark:bg-gray-800 shadow-lg max-h-[90vh] overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {date && (
                  <span className="flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5" />
                    {formatDate(date)}
                  </span>
                )}
              </Dialog.Title>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            {scheduleHint && (
              <div className="mt-4 flex items-start gap-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 px-3 py-2.5">
                <Info className="w-4 h-4 text-blue-500 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">{scheduleHint}</p>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {visibleEvents.length === 0 ? (
              <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">
                Niciun eveniment in aceasta zi.
              </p>
            ) : (
              <div className="space-y-2">
                {visibleEvents.map((event, index) => {
                  const startTime = moment(event.start).format("HH:mm");
                  const endTime = moment(event.end).format("HH:mm");

                  const dayEnd = moment(date).endOf("day");
                  const eventEnd = moment(event.end);
                  const now = moment();

                  const continuesToNextDay = eventEnd.isAfter(dayEnd);
                  const hasPassed = eventEnd.isBefore(now);

                  let continuationMessage = null;
                  if (continuesToNextDay) {
                    const nextDayEndTime = eventEnd.format("HH:mm");
                    const nextDay = moment(eventEnd).startOf("day");
                    const tomorrow = moment(date).add(1, "day").startOf("day");

                    continuationMessage = nextDay.isSame(tomorrow, "day")
                      ? `Astazi pana la 23:59, se continua urmatoarea zi pana la ora ${nextDayEndTime}`
                      : `Astazi pana la 23:59, se continua pe ${eventEnd.format("DD/MM/YYYY")} pana la ora ${nextDayEndTime}`;
                  }

                  let dotColor = "#34a853";
                  if (event.isBlocked) {
                    dotColor = "#5f6368";
                  } else if (hasPassed) {
                    dotColor = "#9ca3af";
                  }

                  return (
                    <button
                      key={event.id || index}
                      type="button"
                      onClick={() => {
                        if (event.isBlocked) {
                          onSelectBlockedEvent(event);
                        } else {
                          onSelectBooking(event.id);
                        }
                      }}
                      className="w-full text-left rounded-lg border border-gray-200 dark:border-gray-700 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: dotColor }}
                        />
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {startTime} - {continuesToNextDay ? "23:59" : endTime}
                        </span>
                        {!event.isBlocked && !!event.guests && (
                          <span className="ml-auto flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                            <Users className="w-3 h-3" />
                            {event.guests}
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">
                        {event.title || event.eventName || "Eveniment"}
                      </p>
                      {continuationMessage && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 italic">
                          {continuationMessage}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {(onAddEvent || onBlockDay) && date && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
              {onAddEvent && (
                <button
                  type="button"
                  onClick={() => onAddEvent(date)}
                  className="btn-primary w-full flex items-center justify-center gap-2 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Adauga eveniment
                </button>
              )}
              {onBlockDay && (
                <button
                  type="button"
                  onClick={() => onBlockDay(date)}
                  className="w-full flex items-center justify-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <Lock className="w-4 h-4" />
                  Blocheaza interval
                </button>
              )}
            </div>
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default DayTimelineModal;
