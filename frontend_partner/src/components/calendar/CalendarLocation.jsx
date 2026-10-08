import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import { momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";
import "moment/locale/ro";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Dialog } from "@headlessui/react";
import "./CalendarLocation.css";
import {
  getBookings,
  getBookingMetadata,
  getBlockedDates,
  createBlockedDate,
  deleteBlockedDate,
} from "../../api/bookings/bookings";
import { getAvailabilityRules } from "../../api/locations/locations";
import {
  prepareRecurringBlockedRules,
  expandPreparedRecurringBlocksToEvents,
} from "../calendarRecurringBlocks";
import { prepareScheduleRules, expandScheduleClosedToTimelineEvents } from "../calendarScheduleClosed";
import {
  transformBookingToEvent,
  transformBlockedDateToEvent,
  busyIntervalsFromDayEvents,
  freeIntervalsFromBusy,
  minuteOfDayToHHmm,
  exclusiveEndMinuteToCheckOutHHmm,
  combineDateTime,
  getCurrentTimeRoundedForPicker,
  hhmmToMinutes,
  getScheduleOpenWindowForDay,
  formatEventTimeRange,
  formatMinuteRange,
} from "./calendarHelpers";
import CalendarSidebar from "./CalendarSidebar";
import CalendarGrid from "./CalendarGrid";
import SlotActionModal from "./modals/SlotActionModal";
import BlockedEventModal from "./modals/BlockedEventModal";
import DayTimelineModal from "./modals/DayTimelineModal";
import NewBookingModal from "./modals/NewBookingModal";
import BookingDetailsModal from "./modals/BookingDetailsModal";
import AvailabilityRulesModal from "./modals/AvailabilityRulesModal";

moment.locale("ro");
const localizer = momentLocalizer(moment);

const CalendarLocation = (props = {}) => {
  const { locationId: locationIdProp } = props;
  const { slug } = useParams();
  const locationIdFromRoute = slug ? slug.split("-")[0] : undefined;
  const needsLocationPicker = !locationIdProp && !locationIdFromRoute;
  const [pickerLocationId, setPickerLocationId] = useState("");
  const [locationsForPicker, setLocationsForPicker] = useState([]);
  const [pickerInitDone, setPickerInitDone] = useState(!needsLocationPicker);

  const locationId =
    locationIdProp ||
    locationIdFromRoute ||
    (needsLocationPicker ? pickerLocationId || undefined : undefined);

  const locationOptions = useMemo(
    () => locationsForPicker.map((loc) => ({ value: loc.id, label: loc.name })),
    [locationsForPicker]
  );

  const [currentDate, setCurrentDate] = useState(new Date());
  const [fullscreen, setFullscreen] = useState(false);
  const [currentLocation, setCurrentLocation] = useState("Locație");
  const [events, setEvents] = useState([]);
  const [preparedRecurringBlockedRules, setPreparedRecurringBlockedRules] = useState([]);
  const [preparedScheduleRules, setPreparedScheduleRules] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isOpen, setIsOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalNewBooking, setIsModalNewBooking] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [checkInTime, setCheckInTime] = useState("");
  const [checkOutTime, setCheckOutTime] = useState("");
  const [blockReason, setBlockReason] = useState("");
  const [isTimelineModalOpen, setIsTimelineModalOpen] = useState(false);
  const [selectedDateForTimeline, setSelectedDateForTimeline] = useState(null);
  const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState(false);
  const [slotActionMode, setSlotActionMode] = useState("full");

  /** Blocări recurente din reguli API — doar pentru modalul cu desfășurătorul zilei, nu în grid-ul calendarului */
  const recurringTimelineEvents = useMemo(() => {
    const rangeStart = moment(currentDate).startOf("month").subtract(1, "day").startOf("day").toDate();
    const rangeEnd = moment(currentDate).endOf("month").add(1, "day").endOf("day").toDate();
    return expandPreparedRecurringBlocksToEvents(rangeStart, rangeEnd, preparedRecurringBlockedRules);
  }, [currentDate, preparedRecurringBlockedRules]);

  const scheduleTimelineEvents = useMemo(() => {
    const rangeStart = moment(currentDate).startOf("month").subtract(1, "day").startOf("day").toDate();
    const rangeEnd = moment(currentDate).endOf("month").add(1, "day").endOf("day").toDate();
    return expandScheduleClosedToTimelineEvents(rangeStart, rangeEnd, preparedScheduleRules);
  }, [currentDate, preparedScheduleRules]);

  const getEventsForDate = useCallback(
    (date) => {
      const dateStart = moment(date).startOf("day");
      const dateEnd = moment(date).endOf("day");

      return [...events, ...recurringTimelineEvents, ...scheduleTimelineEvents].filter((event) => {
        const eventStart = moment(event.start);
        const eventEnd = moment(event.end);

        return eventStart.isSameOrBefore(dateEnd) && eventEnd.isSameOrAfter(dateStart);
      });
    },
    [events, recurringTimelineEvents, scheduleTimelineEvents]
  );

  const openSlotActionForDay = useCallback(
    (day, mode = "add") => {
      const dayStart = moment(day).startOf("day").toDate();
      const dayEnd = moment(day).startOf("day").hour(23).minute(59).second(0).millisecond(0).toDate();
      const dayScheduleWindow = getScheduleOpenWindowForDay(dayStart, preparedScheduleRules);
      const isToday = moment(day).isSame(moment(), "day");
      const currentRoundedMinutes = hhmmToMinutes(getCurrentTimeRoundedForPicker());
      const defaultStartMinutes = dayScheduleWindow
        ? isToday
          ? Math.max(currentRoundedMinutes, dayScheduleWindow.startMinutes)
          : dayScheduleWindow.startMinutes
        : isToday
        ? currentRoundedMinutes
        : 0;

      setSelectedSlot({ start: dayStart, end: dayEnd, isSameDay: true });
      setSelectedEvent(null);
      setIsEditing(false);
      setSlotActionMode(mode);
      setCheckInTime(minuteOfDayToHHmm(defaultStartMinutes));
      setCheckOutTime(
        dayScheduleWindow ? exclusiveEndMinuteToCheckOutHHmm(dayScheduleWindow.endMinutes) : "23:59"
      );
      setBlockReason("");
      setIsTimelineModalOpen(false);
      setIsOpen(true);
    },
    [preparedScheduleRules]
  );

  const openAddEventForDay = useCallback((day) => openSlotActionForDay(day, "add"), [openSlotActionForDay]);
  const openBlockDayForDay = useCallback((day) => openSlotActionForDay(day, "block"), [openSlotActionForDay]);

  const handleSelectSlot = ({ start, end }) => {
    const actualEnd = new Date(end);
    actualEnd.setMilliseconds(actualEnd.getMilliseconds() - 1);

    const startDateOnly = moment(start).startOf("day");
    const endDateOnly = moment(actualEnd).startOf("day");
    const isSameDay = startDateOnly.isSame(endDateOnly, "day");

    if (isSameDay) {
      const dayEvents = getEventsForDate(start).filter((event) => !event.isScheduleClosed);
      if (dayEvents.length > 0) {
        setSelectedDateForTimeline(start);
        setIsTimelineModalOpen(true);
        return;
      }
    }

    const normalizedStart = new Date(start);
    normalizedStart.setHours(0, 0, 0, 0);

    const normalizedEnd = new Date(actualEnd);
    normalizedEnd.setHours(23, 59, 0, 0);

    const dayScheduleWindow = getScheduleOpenWindowForDay(normalizedStart, preparedScheduleRules);
    const isToday = moment(normalizedStart).isSame(moment(), "day");
    const currentRoundedMinutes = hhmmToMinutes(getCurrentTimeRoundedForPicker());
    const defaultStartMinutes = dayScheduleWindow
      ? isToday
        ? Math.max(currentRoundedMinutes, dayScheduleWindow.startMinutes)
        : dayScheduleWindow.startMinutes
      : isToday
      ? currentRoundedMinutes
      : 0;

    setSelectedSlot({ start: normalizedStart, end: normalizedEnd, isSameDay });
    setSelectedEvent(null);
    setIsEditing(false);
    setSlotActionMode("full");
    setCheckInTime(minuteOfDayToHHmm(defaultStartMinutes));
    setCheckOutTime(
      dayScheduleWindow ? exclusiveEndMinuteToCheckOutHHmm(dayScheduleWindow.endMinutes) : "23:59"
    );
    setIsOpen(true);
  };

  const handleSelectEvent = (event) => {
    if (event.isBlocked) {
      setSelectedEvent(event);
      setSelectedSlot(null);
      setIsEditing(false);
      setIsOpen(true);
    } else {
      setSelectedBookingId(event.id);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = async () => {
    setIsModalOpen(false);
    setSelectedBookingId(null);
    await fetchBookings(false);
  };

  const handleBlockDate = async () => {
    if (!selectedSlot || !checkInTime || !checkOutTime || !locationId) {
      alert("Selectează atât ora de început, cât și ora de sfârșit.");
      return;
    }

    try {
      const startDate = combineDateTime(selectedSlot.start, checkInTime);
      const endDate = selectedSlot.isSameDay
        ? combineDateTime(selectedSlot.start, checkOutTime)
        : combineDateTime(selectedSlot.end, checkOutTime);

      if (endDate < startDate) {
        alert("Ora de sfârșit trebuie să fie după ora de început.");
        return;
      }

      const { status } = await createBlockedDate({
        locationId: parseInt(locationId),
        checkIn: startDate.toISOString(),
        checkOut: endDate.toISOString(),
        reason: blockReason || undefined,
      });

      if (status === 200 || status === 201) {
        setIsOpen(false);
        setSlotActionMode("full");
        setCheckInTime("");
        setCheckOutTime("");
        setBlockReason("");
        await fetchBookings(false);
      } else {
        alert("Blocarea a eșuat. Încearcă din nou.");
      }
    } catch (error) {
      console.error("Error blocking date:", error);
      alert("Eroare la blocarea datei. Încearcă din nou.");
    }
  };

  const handleQuickAddEvent = () => {
    openAddEventForDay(new Date());
  };

  const handleQuickBlockDay = () => {
    if (!locationId) return;
    openBlockDayForDay(new Date());
  };

  const handleSlotStartDateChange = (date) => {
    if (!date) return;
    setSelectedSlot((prev) => {
      const newStart = moment(date).startOf("day").toDate();
      const currentEnd = prev?.end ?? newStart;
      const newEnd = moment(currentEnd).isBefore(moment(newStart), "day") ? newStart : currentEnd;
      return { start: newStart, end: newEnd, isSameDay: moment(newStart).isSame(moment(newEnd), "day") };
    });
  };

  const handleSlotEndDateChange = (date) => {
    if (!date) return;
    setSelectedSlot((prev) => {
      const newEnd = moment(date).startOf("day").toDate();
      const currentStart = prev?.start ?? newEnd;
      return { start: currentStart, end: newEnd, isSameDay: moment(currentStart).isSame(moment(newEnd), "day") };
    });
  };

  const handleGoToAvailabilitySettings = () => {
    if (!locationId) return;
    setIsAvailabilityModalOpen(true);
  };

  const slotDateIsToday = !!selectedSlot && moment(selectedSlot.start).isSame(moment(), "day");

  const scheduleWindowForSlotStart = selectedSlot
    ? getScheduleOpenWindowForDay(selectedSlot.start, preparedScheduleRules)
    : undefined;
  const scheduleWindowForSlotEnd = selectedSlot
    ? getScheduleOpenWindowForDay(
        selectedSlot.isSameDay ? selectedSlot.start : selectedSlot.end,
        preparedScheduleRules
      )
    : undefined;

  /** Ca admin nu ești limitat de programul de disponibilitate — acesta e doar afișat ca mențiune. */
  const getMinStartTimeForPicker = () => {
    if (!slotDateIsToday) return undefined;
    return minuteOfDayToHHmm(hhmmToMinutes(getCurrentTimeRoundedForPicker()));
  };

  const getMaxStartTimeForPicker = () => undefined;

  const getMinEndTimeForPicker = () => {
    if (!(selectedSlot?.isSameDay && checkInTime)) return undefined;
    return minuteOfDayToHHmm(hhmmToMinutes(checkInTime) + 15);
  };

  const getMaxEndTimeForPicker = () => undefined;

  const formatScheduleWindow = (window) => {
    const range = `${minuteOfDayToHHmm(window.startMinutes)} - ${exclusiveEndMinuteToCheckOutHHmm(window.endMinutes)}`;
    return window.label ? `${window.label}: ${range}` : `Program disponibil: ${range}`;
  };

  const scheduleHint = (() => {
    if (!scheduleWindowForSlotStart && !scheduleWindowForSlotEnd) return null;
    if (
      scheduleWindowForSlotStart &&
      scheduleWindowForSlotEnd &&
      scheduleWindowForSlotStart.startMinutes === scheduleWindowForSlotEnd.startMinutes &&
      scheduleWindowForSlotStart.endMinutes === scheduleWindowForSlotEnd.endMinutes &&
      scheduleWindowForSlotStart.label === scheduleWindowForSlotEnd.label
    ) {
      return formatScheduleWindow(scheduleWindowForSlotStart);
    }
    const parts = [];
    if (scheduleWindowForSlotStart) parts.push(`ziua de început — ${formatScheduleWindow(scheduleWindowForSlotStart)}`);
    if (scheduleWindowForSlotEnd) parts.push(`ziua de sfârșit — ${formatScheduleWindow(scheduleWindowForSlotEnd)}`);
    return parts.join(" · ");
  })();

  const timelineScheduleWindow = selectedDateForTimeline
    ? getScheduleOpenWindowForDay(selectedDateForTimeline, preparedScheduleRules)
    : undefined;
  const timelineScheduleHint = timelineScheduleWindow ? formatScheduleWindow(timelineScheduleWindow) : null;

  const dayHasEvents = (date) => getEventsForDate(date).some((event) => !event.isScheduleClosed);

  /** Intervale (in minute de la miezul nopții) deja ocupate de alte evenimente în acea zi */
  const getBusyMinuteRangesForDay = (day) => {
    if (!day) return [];
    const dayEvents = getEventsForDate(day).filter(
      (event) => !event.isScheduleClosed && event.id !== selectedEvent?.id
    );
    if (!dayEvents.length) return [];
    return busyIntervalsFromDayEvents(day, dayEvents);
  };

  const buildDayAvailabilityPanel = (day, label) => {
    const dayEvents = getEventsForDate(day).filter((event) => !event.isScheduleClosed);
    if (!dayEvents.length) return null;

    const scheduleWindow = getScheduleOpenWindowForDay(day, preparedScheduleRules);
    const busy = busyIntervalsFromDayEvents(day, dayEvents);
    const freeIntervals = freeIntervalsFromBusy(busy, scheduleWindow);
    const sortedEvents = [...dayEvents].sort((a, b) => moment(a.start).valueOf() - moment(b.start).valueOf());

    return {
      label,
      events: sortedEvents.map(
        (event) => `${formatEventTimeRange(event)}${event.title ? ` · ${event.title}` : ""}`
      ),
      freeIntervalsText: freeIntervals.map(formatMinuteRange).join(", "),
    };
  };

  const dayAvailabilityPanels = (() => {
    if (!selectedSlot) return [];
    if (selectedSlot.isSameDay) {
      const panel = buildDayAvailabilityPanel(selectedSlot.start, null);
      return panel ? [panel] : [];
    }
    return [
      buildDayAvailabilityPanel(selectedSlot.start, "Ziua de început"),
      buildDayAvailabilityPanel(selectedSlot.end, "Ziua de sfârșit"),
    ].filter(Boolean);
  })();

  const fetchBlockedDates = useCallback(async () => {
    if (!locationId) {
      return [];
    }

    try {
      const { status, response } = await getBlockedDates(locationId);

      if (status && response?.data) {
        return Array.isArray(response.data) ? response.data.map(transformBlockedDateToEvent) : [];
      }
      return [];
    } catch (error) {
      console.error("Error fetching blocked dates:", error);
      return [];
    }
  }, [locationId]);

  const fetchBookings = useCallback(
    async (showLoading = true) => {
      if (!locationId) {
        setPreparedRecurringBlockedRules([]);
        setPreparedScheduleRules([]);
        if (showLoading && (!needsLocationPicker || pickerInitDone)) {
          setLoading(false);
        }
        return;
      }

      try {
        if (showLoading) {
          setLoading(true);
        }
        const queryParams = {
          locationId: locationId,
          status: ["confirmed"],
        };

        const [bookingsResult, blockedEvents, availabilityResult] = await Promise.all([
          getBookings(queryParams),
          fetchBlockedDates(),
          getAvailabilityRules(parseInt(locationId, 10)).catch(() => null),
        ]);

        if (availabilityResult && availabilityResult.status === 200 && availabilityResult.response?.data) {
          const items = availabilityResult.response.data;
          setPreparedRecurringBlockedRules(prepareRecurringBlockedRules(items));
          setPreparedScheduleRules(prepareScheduleRules(items));
        } else {
          setPreparedRecurringBlockedRules([]);
          setPreparedScheduleRules([]);
        }

        const { status, response } = bookingsResult;

        if (status && response?.data) {
          const transformedEvents = response.data.map(transformBookingToEvent);

          if (transformedEvents.length > 0 && transformedEvents[0].location) {
            setCurrentLocation(transformedEvents[0].location);
          }

          setEvents([...transformedEvents, ...blockedEvents]);
        } else {
          setEvents(blockedEvents);
        }
      } catch (error) {
        console.error("Error fetching bookings:", error);
        setPreparedRecurringBlockedRules([]);
        setPreparedScheduleRules([]);
        try {
          const blockedEvents = await fetchBlockedDates();
          setEvents(blockedEvents);
        } catch (blockedError) {
          console.error("Error fetching blocked dates:", blockedError);
          setEvents([]);
        }
      } finally {
        if (showLoading) {
          setLoading(false);
        }
      }
    },
    [locationId, fetchBlockedDates, needsLocationPicker, pickerInitDone]
  );

  const fetchLocations = useCallback(async () => {
    try {
      const { status, response } = await getBookingMetadata();
      if (status === 200 && response?.data?.locations) {
        if (locationId) {
          const currentLoc = response.data.locations.find(
            (loc) => loc.id === locationId || loc.id?.toString() === locationId
          );
          if (currentLoc) {
            setCurrentLocation(currentLoc.name || "Locație");
          }
        }
      }
    } catch (error) {
      console.error("Error fetching locations:", error);
    }
  }, [locationId]);

  useEffect(() => {
    if (!needsLocationPicker) {
      return;
    }
    let cancelled = false;
    setPickerInitDone(false);
    (async () => {
      try {
        const { status, response } = await getBookingMetadata();
        if (cancelled) return;
        if (status === 200 && response?.data?.locations) {
          const list = response.data.locations
            .map((loc) => ({
              id: loc.id != null ? String(loc.id) : "",
              name: loc.name ?? "Locație",
            }))
            .filter((l) => l.id);
          setLocationsForPicker(list);
          setPickerLocationId((prev) => prev || list[0]?.id || "");
        } else {
          setLocationsForPicker([]);
        }
      } catch (error) {
        console.error("Error fetching locations for calendar:", error);
        if (!cancelled) setLocationsForPicker([]);
      } finally {
        if (!cancelled) setPickerInitDone(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [needsLocationPicker]);

  useEffect(() => {
    fetchLocations();
    fetchBookings();
  }, [fetchLocations, fetchBookings]);

  const [view, setView] = useState(Views.MONTH);

  const handleViewChange = (newView) => {
    if (newView === Views.MONTH || newView === Views.WEEK || newView === Views.DAY) {
      setView(newView);
    }
  };

  const handleUnblockDate = async () => {
    if (!selectedEvent || !selectedEvent.id || !locationId) {
      return;
    }

    if (selectedEvent.isRecurringRuleBlock || selectedEvent.isScheduleClosed) {
      return;
    }

    try {
      const { status } = await deleteBlockedDate({
        id: selectedEvent.id,
        locationId: parseInt(locationId),
      });
      if (status === 200 || status === 201 || status === 204) {
        setSelectedEvent(null);
        setIsOpen(false);
        await fetchBookings(false);
      } else {
        alert("Deblocarea a eșuat. Încearcă din nou.");
      }
    } catch (error) {
      console.error("Error unblocking date:", error);
      alert("Eroare la deblocarea datei. Încearcă din nou.");
    }
  };

  const showPickerLoading = needsLocationPicker && !pickerInitDone;
  const showNoLocations = needsLocationPicker && pickerInitDone && locationsForPicker.length === 0;

  const today = new Date();
  const todayEvents = getEventsForDate(today)
    .filter((event) => !event.isScheduleClosed)
    .sort((a, b) => moment(a.start).valueOf() - moment(b.start).valueOf());

  const todayScheduleWindow = getScheduleOpenWindowForDay(today, preparedScheduleRules);
  const todayAvailabilityText = todayScheduleWindow
    ? formatScheduleWindow(todayScheduleWindow)
    : null;

  const calendarGridProps = {
    localizer,
    events,
    view,
    onViewChange: handleViewChange,
    currentDate,
    onNavigateDate: (date) => setCurrentDate(date),
    onSelectSlot: handleSelectSlot,
    onSelectEvent: handleSelectEvent,
    onShowMore: (_events, date) => {
      setSelectedDateForTimeline(date);
      setIsTimelineModalOpen(true);
    },
    height: "100%",
    needsLocationPicker,
    locationOptions,
    pickerLocationId,
    onPickerLocationChange: setPickerLocationId,
    currentLocation,
    fullscreen,
    onToggleFullscreen: () => setFullscreen((prev) => !prev),
  };

  return (
    <div className="flex h-[calc(100vh-200px)] overflow-hidden gap-4">
      <div className="flex flex-col w-4/5 min-w-0">
        <div className="google-calendar-container bg-white dark:bg-gray-900 h-full min-h-0 flex flex-col">
          <div className="flex min-h-0 flex-1 flex-col pb-6">
            {showPickerLoading ? (
              <div className="flex h-full min-h-0 flex-1 items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400">Se încarcă locațiile...</p>
              </div>
            ) : showNoLocations ? (
              <div className="flex h-full min-h-0 flex-1 items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400">Nu există locații disponibile.</p>
              </div>
            ) : loading ? (
              <div className="flex h-full min-h-0 flex-1 items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400">Se încarcă rezervările...</p>
              </div>
            ) : (
              <div className="flex min-h-0 flex-1 flex-col">
                <CalendarGrid {...calendarGridProps} />
              </div>
            )}
          </div>
        </div>
      </div>

      <CalendarSidebar
        today={today}
        todayEvents={todayEvents}
        todayAvailabilityText={todayAvailabilityText}
        onSelectEvent={handleSelectEvent}
        onQuickAddEvent={handleQuickAddEvent}
        onQuickBlockDay={handleQuickBlockDay}
        onGoToAvailabilitySettings={handleGoToAvailabilitySettings}
        locationId={locationId}
      />

      <BlockedEventModal
        open={selectedEvent !== null && selectedEvent.isBlocked && !isEditing}
        onClose={() => {
          setSelectedEvent(null);
          setIsOpen(false);
        }}
        event={selectedEvent}
        onUnblock={handleUnblockDate}
      />

      <BookingDetailsModal open={isModalOpen} onClose={handleCloseModal} bookingId={selectedBookingId} />

      <Dialog open={fullscreen} onClose={() => setFullscreen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center">
          <Dialog.Panel className="flex h-full w-full min-h-0 flex-col bg-white dark:bg-gray-900">
            <div className="flex min-h-0 flex-1 gap-4 p-6">
              <div className="flex min-h-0 flex-1 flex-col">
                <CalendarGrid {...calendarGridProps} />
              </div>
              <CalendarSidebar
                today={today}
                todayEvents={todayEvents}
                todayAvailabilityText={todayAvailabilityText}
                onSelectEvent={handleSelectEvent}
                onQuickAddEvent={handleQuickAddEvent}
                onQuickBlockDay={handleQuickBlockDay}
                onGoToAvailabilitySettings={handleGoToAvailabilitySettings}
                locationId={locationId}
              />
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      <SlotActionModal
        open={isOpen && (!selectedEvent || isEditing)}
        onClose={() => {
          setIsOpen(false);
          setSlotActionMode("full");
          setCheckInTime("");
          setCheckOutTime("");
          setBlockReason("");
        }}
        selectedSlot={selectedSlot}
        onStartDateChange={handleSlotStartDateChange}
        onEndDateChange={handleSlotEndDateChange}
        mode={slotActionMode}
        checkInTime={checkInTime}
        setCheckInTime={setCheckInTime}
        checkOutTime={checkOutTime}
        setCheckOutTime={setCheckOutTime}
        blockReason={blockReason}
        setBlockReason={setBlockReason}
        minStartTime={getMinStartTimeForPicker()}
        maxStartTime={getMaxStartTimeForPicker()}
        minEndTime={getMinEndTimeForPicker()}
        maxEndTime={getMaxEndTimeForPicker()}
        checkInBusyRanges={selectedSlot ? getBusyMinuteRangesForDay(selectedSlot.start) : []}
        checkOutBusyRanges={
          selectedSlot
            ? getBusyMinuteRangesForDay(selectedSlot.isSameDay ? selectedSlot.start : selectedSlot.end)
            : []
        }
        preferredStartTime={
          scheduleWindowForSlotStart ? minuteOfDayToHHmm(scheduleWindowForSlotStart.startMinutes) : undefined
        }
        scheduleHint={scheduleHint}
        dayHasEvents={dayHasEvents}
        dayAvailabilityPanels={dayAvailabilityPanels}
        onAddBooking={() => {
          if (!selectedSlot || !checkInTime || !checkOutTime) {
            alert("Selectează atât ora de început, cât și ora de sfârșit.");
            return;
          }
          const startDateTime = combineDateTime(selectedSlot.start, checkInTime);
          const endDateTime = selectedSlot.isSameDay
            ? combineDateTime(selectedSlot.start, checkOutTime)
            : combineDateTime(selectedSlot.end, checkOutTime);
          if (endDateTime <= startDateTime) {
            alert("Ora de sfârșit trebuie să fie după ora de început.");
            return;
          }
          setIsOpen(false);
          setIsModalNewBooking(true);
        }}
        onBlockDate={handleBlockDate}
      />

      <NewBookingModal
        open={isModalNewBooking}
        onClose={async () => {
          setIsModalNewBooking(false);
          setCheckInTime("");
          setCheckOutTime("");
          await fetchBookings(false);
        }}
        initialCheckIn={
          selectedSlot && checkInTime ? combineDateTime(selectedSlot.start, checkInTime).toISOString() : undefined
        }
        initialCheckOut={
          selectedSlot && checkOutTime
            ? selectedSlot.isSameDay
              ? combineDateTime(selectedSlot.start, checkOutTime).toISOString()
              : combineDateTime(selectedSlot.end, checkOutTime).toISOString()
            : undefined
        }
      />

      <DayTimelineModal
        open={isTimelineModalOpen}
        onClose={() => {
          setIsTimelineModalOpen(false);
          setSelectedDateForTimeline(null);
        }}
        date={selectedDateForTimeline}
        dayEvents={selectedDateForTimeline ? getEventsForDate(selectedDateForTimeline) : []}
        scheduleHint={timelineScheduleHint}
        onSelectBlockedEvent={(event) => {
          setSelectedEvent(event);
          setIsTimelineModalOpen(false);
          setIsOpen(true);
        }}
        onSelectBooking={(bookingId) => {
          setSelectedBookingId(bookingId);
          setIsTimelineModalOpen(false);
          setIsModalOpen(true);
        }}
        onAddEvent={openAddEventForDay}
        onBlockDay={openBlockDayForDay}
      />

      <AvailabilityRulesModal
        open={isAvailabilityModalOpen}
        onClose={async () => {
          setIsAvailabilityModalOpen(false);
          await fetchBookings(false);
        }}
        locationId={locationId}
      />
    </div>
  );
};

export default CalendarLocation;
