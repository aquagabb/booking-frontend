import moment from "moment";
import { Dialog } from "@headlessui/react";
import { CalendarIcon, Clock, X } from "lucide-react";
import { formatDate, formatDateTime, formatTime } from "../calendarHelpers";

const BlockedEventModal = ({ open, onClose, event, onUnblock }) => {
  if (!event) {
    return (
      <Dialog open={open} onClose={onClose} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-2xl rounded-lg bg-white dark:bg-gray-800 shadow-lg" />
        </div>
      </Dialog>
    );
  }

  const startMoment = moment(event.start);
  const endMoment = moment(event.end);
  const isSameDay = startMoment.isSame(endMoment, "day");
  const isStartMidnight = startMoment.hour() === 0 && startMoment.minute() === 0 && startMoment.second() === 0;
  const endOfDay = endMoment.clone().endOf("day");
  const isEndEndOfDay = endMoment.isSameOrAfter(endOfDay.subtract(1, "minute"));
  const isEntireDay = isSameDay && isStartMidnight && isEndEndOfDay;
  const isRecurring = !!event.isRecurringRuleBlock;
  const isScheduleClosed = !!event.isScheduleClosed;

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-2xl rounded-lg bg-white dark:bg-gray-800 shadow-lg">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {isScheduleClosed
                  ? event.title || "Program"
                  : isRecurring
                    ? "Blocare recurentă (reguli disponibilitate)"
                    : "Blocked Date"}
              </Dialog.Title>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Event Details</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 flex items-center justify-center">
                    {isEntireDay ? (
                      <CalendarIcon className="w-5 h-5 text-gray-400" />
                    ) : (
                      <Clock className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Block Type</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {isScheduleClosed
                        ? "Interval închis (nu e în orele de deschidere din program)"
                        : isRecurring
                          ? "Interval orar blocat în mod recurent"
                          : isEntireDay
                            ? "Zi blocata complet"
                            : "Blocare partiala"}
                    </p>
                  </div>
                </div>

                {isScheduleClosed && event.schedulePeriodNote && (
                  <div className="flex items-start gap-3">
                    <CalendarIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Perioadă regulă</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {event.schedulePeriodNote}
                      </p>
                    </div>
                  </div>
                )}

                {isRecurring && event.recurrencePeriodNote && (
                  <div className="flex items-start gap-3">
                    <CalendarIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Perioadă activă</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {event.recurrencePeriodNote}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Fără date în API înseamnă permanent, pe zilele setate în regulă. Cu date, se aplică doar
                        între acel interval.
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <CalendarIcon className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {isEntireDay ? "Data" : "Data si ora start"}
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {isEntireDay ? formatDate(event.start) : formatDateTime(event.start)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <CalendarIcon className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {isEntireDay ? "Data" : "Data si ora sfarsit"}
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {isEntireDay ? formatDate(event.end) : formatDateTime(event.end)}
                    </p>
                  </div>
                </div>

                {!isEntireDay && (
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Interval orar</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {formatTime(event.start)} - {formatTime(event.end)}
                      </p>
                    </div>
                  </div>
                )}

                {event.reason && (
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 flex items-center justify-center mt-0.5">
                      <span className="text-gray-400">📝</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Motiv</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{event.reason}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {!isRecurring && !isScheduleClosed && (
              <div className="mt-6 flex justify-end">
                <button
                  onClick={onUnblock}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Unblock
                </button>
              </div>
            )}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default BlockedEventModal;
