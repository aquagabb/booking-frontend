import moment from "moment";
import { Dialog } from "@headlessui/react";
import { CalendarIcon, Clock, Users, X } from "lucide-react";
import { formatDate } from "../calendarHelpers";

const DayTimelineModal = ({
  open,
  onClose,
  date,
  dayEvents,
  timelineDayLayout,
  onOpenFreeSlot,
  onSelectBlockedEvent,
  onSelectBooking,
  mapMinuteToDisplayY,
  mapDisplayYToMinute,
  DAY_MINUTES,
}) => {
  return (
    <Dialog open={open} onClose={onClose} className="relative z-40">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-3xl rounded-lg bg-white dark:bg-gray-800 shadow-lg max-h-[90vh] overflow-hidden flex flex-col">
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
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {date && (
              <div className="relative px-2 py-4">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 text-center">
                  Click pe o oră liberă în grilă sau pe eticheta orei pentru rezervare sau blocare.
                </p>
                <div
                  className="timeline-time-labels"
                  style={{ height: `${timelineDayLayout?.layout.totalHeightPx ?? DAY_MINUTES}px` }}
                >
                  {Array.from({ length: 24 }, (_, i) => i)
                    .filter((i) => {
                      if (!timelineDayLayout) return true;
                      const minute = i * 60;
                      return !timelineDayLayout.compactRanges.some(
                        (range) => minute > range.start && minute < range.end
                      );
                    })
                    .map((i) => {
                      const top = timelineDayLayout
                        ? mapMinuteToDisplayY(timelineDayLayout.layout, i * 60)
                        : i * 60;
                      return (
                        <button
                          key={i}
                          type="button"
                          className="timeline-time-label w-full border-0 bg-transparent text-right"
                          style={{ top: `${top}px` }}
                          title={`Selectează intervalul liber la ${i.toString().padStart(2, "0")}:00`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenFreeSlot(date, i * 60);
                          }}
                        >
                          {i.toString().padStart(2, "0")}:00
                        </button>
                      );
                    })}
                </div>
                <div
                  className="timeline-container"
                  style={{ height: `${timelineDayLayout?.layout.totalHeightPx ?? DAY_MINUTES}px` }}
                  onClick={(e) => {
                    if (e.target !== e.currentTarget) return;
                    const y = e.nativeEvent.offsetY;
                    const minuteY = timelineDayLayout ? mapDisplayYToMinute(timelineDayLayout.layout, y) : y;
                    onOpenFreeSlot(date, minuteY);
                  }}
                >
                  {dayEvents
                    .sort((a, b) => moment(a.start).valueOf() - moment(b.start).valueOf())
                    .map((event, index) => {
                      const startTime = moment(event.start).format("HH:mm");
                      const endTime = moment(event.end).format("HH:mm");

                      const dayStart = moment(date).startOf("day");
                      const dayEnd = moment(date).endOf("day");
                      const eventStart = moment(event.start);
                      const eventEnd = moment(event.end);
                      const now = moment();

                      const continuesToNextDay = eventEnd.isAfter(dayEnd);

                      const minutesFromStart = eventStart.isBefore(dayStart)
                        ? 0
                        : eventStart.diff(dayStart, "minutes");

                      const effectiveEnd = continuesToNextDay ? dayEnd : eventEnd;
                      const duration = effectiveEnd.diff(
                        eventStart.isBefore(dayStart) ? dayStart : eventStart,
                        "minutes"
                      );
                      const isScheduleClosedCompact = !!event.isScheduleClosed;

                      const startMinReal = Math.max(0, minutesFromStart);
                      const endMinReal = Math.min(DAY_MINUTES, startMinReal + duration);
                      const topPositionPx = timelineDayLayout
                        ? mapMinuteToDisplayY(timelineDayLayout.layout, startMinReal)
                        : startMinReal;
                      const endPositionPx = timelineDayLayout
                        ? mapMinuteToDisplayY(timelineDayLayout.layout, endMinReal)
                        : endMinReal;
                      const heightPx = Math.max(
                        isScheduleClosedCompact ? 28 : 50,
                        endPositionPx - topPositionPx
                      );

                      const hasPassed = eventEnd.isBefore(now);

                      let continuationMessage = null;
                      if (continuesToNextDay) {
                        const nextDayEndTime = eventEnd.format("HH:mm");
                        const nextDay = moment(eventEnd).startOf("day");
                        const tomorrow = moment(date).add(1, "day").startOf("day");

                        if (nextDay.isSame(tomorrow, "day")) {
                          continuationMessage = `Astăzi până la 23:59, se continuă următoarea zi până la ora ${nextDayEndTime}`;
                        } else {
                          const nextDayDate = eventEnd.format("DD/MM/YYYY");
                          continuationMessage = `Astăzi până la 23:59, se continuă pe ${nextDayDate} până la ora ${nextDayEndTime}`;
                        }
                      }

                      let backgroundColor = "";
                      if (event.isScheduleClosed) {
                        backgroundColor = "#374151";
                      } else if (event.isBlocked) {
                        backgroundColor = "#5f6368";
                      } else if (hasPassed) {
                        backgroundColor = "#9ca3af";
                      } else {
                        backgroundColor = "#34a853";
                      }

                      return (
                        <div
                          key={event.id || index}
                          className={`timeline-event-item${isScheduleClosedCompact ? " timeline-event-item--compact" : ""}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (event.isBlocked) {
                              onSelectBlockedEvent(event);
                            } else {
                              onSelectBooking(event.id);
                            }
                          }}
                          style={{
                            backgroundColor,
                            top: `${Math.max(0, topPositionPx)}px`,
                            height: `${heightPx}px`,
                          }}
                        >
                          {isScheduleClosedCompact ? (
                            <div className="timeline-event-compact-content">
                              <Clock className="w-3 h-3 flex-shrink-0" />
                              <span className="timeline-event-compact-time">
                                {startTime} <span className="timeline-event-compact-dots">···</span> {endTime}
                              </span>
                              <span className="timeline-event-compact-title">{event.title || "Închis"}</span>
                            </div>
                          ) : (
                            <div className="timeline-event-content">
                              {continuationMessage && (
                                <div className="timeline-event-continuation">
                                  <span className="continuation-text">{continuationMessage}</span>
                                </div>
                              )}
                              <div className="timeline-event-main">
                                <span className="timeline-event-time">
                                  {startTime} - {continuesToNextDay ? "23:59" : endTime}
                                </span>
                                <span className="timeline-event-separator mr-1">, </span>
                                <span className="timeline-event-title">
                                  {event.title || event.eventName || "Event"}
                                </span>
                                {!event.isBlocked && !!event.guests && (
                                  <span className="timeline-event-guests ml-2 inline-flex items-center gap-1">
                                    <Users className="w-3 h-3" />
                                    {event.guests}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default DayTimelineModal;
