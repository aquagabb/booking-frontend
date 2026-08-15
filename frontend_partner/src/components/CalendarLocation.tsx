import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Calendar, momentLocalizer, Views, type View } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Dialog } from "@headlessui/react";
import CustomModal from "./shared/Modals/CustomModal";
import Overview from "../pages/protected/admin/Bookings/Overview";
import { BookingFormBun } from "../pages/protected/admin/Forms/BookingFormBun";
import CustomTextarea from "./shared/CustomTextarea";
import CustomTimePicker from "./shared/CustomTimePicker";
import { 
  Calendar as CalendarIcon, 
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  LayoutGrid,
  Calendar as CalendarLucide,
  Clock
} from "lucide-react";
import "./CalendarLocation.css";
import CustomSelect from "./shared/CustomSelect";
import { getBookings, getBookingMetadata, getBlockedDates, createBlockedDate, deleteBlockedDate, getAvailabilityRules } from "../api/bookings/bookings";
import {
  prepareRecurringBlockedRules,
  expandPreparedRecurringBlocksToEvents,
  type PreparedRecurringBlockedRule,
  type ApiAvailabilityBlockedItem,
} from "./calendarRecurringBlocks";
import {
  prepareScheduleRules,
  expandScheduleClosedToTimelineEvents,
  type PreparedScheduleRule,
} from "./calendarScheduleClosed";

moment.locale("en-gb");
const localizer = momentLocalizer(moment);

const mapStatus = (backendStatus: string): string => {
  const statusMap: Record<string, string> = {
    "confirmed": "Active",
    "pending": "Pending",
    "cancelled": "Cancelled",
    "completed": "Finished",
  };
  return statusMap[backendStatus] || "Pending";
};

const transformBookingToEvent = (booking: any) => {
  return {
    id: booking.id,
    code: booking.code,
    eventName: booking.eventName || "Event",
    location: booking.locationName || "",
    type: booking.eventName || "Event",
    guests: booking.guests || 0,
    customerName: booking.customerName || "",
    customerEmail: booking.customerEmail || "",
    customerPhone: booking.customerPhone || "",
    start: new Date(booking.checkIn),
    end: new Date(booking.checkOut),
    status: mapStatus(booking.status || "pending"),
    title: `${booking.eventName || "Event"} - ${booking.customerName || ""}`,
    isBlocked: false,
  };
};

const DAY_MINUTES = 24 * 60;

function mergeBusyIntervalsMinutes(
  segments: { start: number; end: number }[]
): { start: number; end: number }[] {
  if (!segments.length) return [];
  const sorted = [...segments].sort((a, b) => a.start - b.start);
  const out: { start: number; end: number }[] = [];
  let cur = { ...sorted[0] };
  for (let i = 1; i < sorted.length; i++) {
    const s = sorted[i];
    if (s.start < cur.end) {
      cur.end = Math.max(cur.end, s.end);
    } else {
      out.push(cur);
      cur = { ...s };
    }
  }
  out.push(cur);
  return out;
}

/** Intervale [start, end) în minute de la 00:00, tăiate la ziua calendaristică */
function busyIntervalsFromDayEvents(day: Date, dayEvents: any[]): { start: number; end: number }[] {
  const dayStart = moment(day).startOf("day");
  const dayEnd = moment(day).endOf("day");
  const raw: { start: number; end: number }[] = [];
  for (const event of dayEvents) {
    const es = moment(event.start);
    const ee = moment(event.end);
    const clipStart = moment.max(es, dayStart);
    const clipEnd = moment.min(ee, dayEnd);
    if (clipEnd.isAfter(clipStart)) {
      const start = Math.max(0, clipStart.diff(dayStart, "minutes"));
      const end = Math.min(DAY_MINUTES, clipEnd.diff(dayStart, "minutes"));
      if (end > start) raw.push({ start, end });
    }
  }
  return mergeBusyIntervalsMinutes(raw);
}

function freeIntervalsFromBusy(busy: { start: number; end: number }[]): { start: number; end: number }[] {
  const free: { start: number; end: number }[] = [];
  let cur = 0;
  for (const b of busy) {
    if (b.start > cur) free.push({ start: cur, end: b.start });
    cur = Math.max(cur, b.end);
  }
  if (cur < DAY_MINUTES) free.push({ start: cur, end: DAY_MINUTES });
  return free;
}

function findFreeIntervalContaining(
  free: { start: number; end: number }[],
  minute: number
): { start: number; end: number } | null {
  const m = Math.min(Math.max(0, Math.floor(minute)), DAY_MINUTES - 1);
  return free.find((f) => m >= f.start && m < f.end) ?? null;
}

/** Returnează start (minute) și sfârșit exclusiv, sau null dacă nu e timp liber */
function computeTimelineFreeSlotRange(
  clickedMinuteFromTop: number,
  free: { start: number; end: number }[]
): { slotStart: number; slotEndExclusive: number } | null {
  const clickedMin = Math.min(Math.max(0, Math.floor(clickedMinuteFromTop)), DAY_MINUTES - 1);
  const interval = findFreeIntervalContaining(free, clickedMin);
  if (!interval) return null;

  const hourFloor = Math.floor(clickedMin / 60) * 60;
  let slotStart = Math.max(interval.start, hourFloor);
  let slotEndExclusive = Math.min(interval.end, hourFloor + 60);

  if (slotEndExclusive <= slotStart) {
    slotStart = clickedMin;
    slotEndExclusive = Math.min(interval.end, slotStart + 60);
  }
  if (slotEndExclusive <= slotStart) {
    slotStart = interval.start;
    slotEndExclusive = Math.min(interval.end, interval.start + 60);
  }
  if (slotEndExclusive <= slotStart) return null;

  return { slotStart, slotEndExclusive };
}

function minuteOfDayToHHmm(minute: number): string {
  const m = Math.min(Math.max(0, Math.floor(minute)), DAY_MINUTES - 1);
  const h = Math.floor(m / 60);
  const min = m % 60;
  return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}

/** Sfârșit exclusiv în minute → ora afișată ca check-out (ex. 720 → 12:00) */
function exclusiveEndMinuteToCheckOutHHmm(endExclusive: number): string {
  if (endExclusive >= DAY_MINUTES) return "23:59";
  const h = Math.floor(endExclusive / 60);
  const m = endExclusive % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

const transformBlockedDateToEvent = (blockedDate: any) => {
  const startDate = new Date(blockedDate.startDate);
  const endDate = new Date(blockedDate.endDate);
  
  const startDay = moment(startDate).startOf('day');
  const endDay = moment(endDate).startOf('day');
  const isSameDay = startDay.isSame(endDay, 'day');
  const isStartMidnight = moment(startDate).format('HH:mm:ss') === '00:00:00';
  const isEndMidnight = moment(endDate).format('HH:mm:ss') === '00:00:00';
  
  if (isSameDay && isStartMidnight && isEndMidnight) {
    const blockedDay = moment(startDate).startOf('day').toDate();
    const blockedDayEnd = moment(startDate).endOf('day').toDate();
    
    return {
      id: blockedDate.id || `blocked-${blockedDate.startDate}-${blockedDate.endDate}`,
      title: blockedDate.reason ? `${blockedDate.reason} (complet blocata)` : "Zi blocata complet",
      start: blockedDay,
      end: blockedDayEnd,
      isBlocked: true,
      status: "Blocked",
      reason: blockedDate.reason,
    };
  }
  
  return {
    id: blockedDate.id || `blocked-${blockedDate.startDate}-${blockedDate.endDate}`,
    title: blockedDate.reason || "Blocked",
    start: startDate,
    end: endDate,
    isBlocked: true,
    status: "Blocked",
    reason: blockedDate.reason,
  };
};

interface CalendarLocationProps {
  locationId?: string;
}

const CalendarLocation = (props: CalendarLocationProps = {}) => {
  const { locationId: locationIdProp } = props;
  const { slug } = useParams<{ slug: string }>();
  const locationIdFromRoute = slug ? slug.split("-")[0] : undefined;
  const needsLocationPicker = !locationIdProp && !locationIdFromRoute;
  const [pickerLocationId, setPickerLocationId] = useState("");
  const [locationsForPicker, setLocationsForPicker] = useState<Array<{ id: string; name: string }>>([]);
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
  const [currentLocation, setCurrentLocation] = useState("Location");
  const [events, setEvents] = useState<any[]>([]);
  const [preparedRecurringBlockedRules, setPreparedRecurringBlockedRules] = useState<PreparedRecurringBlockedRule[]>([]);
  const [preparedScheduleRules, setPreparedScheduleRules] = useState<PreparedScheduleRule[]>([]);
  const [loading, setLoading] = useState(true);

  const [isOpen, setIsOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalNewBooking, setIsModalNewBooking] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [chooseAction, setChooseAction] = useState<null | "reservation" | "block">(null);
  const [checkInTime, setCheckInTime] = useState<string>("");
  const [checkOutTime, setCheckOutTime] = useState<string>("");
  const [blockReason, setBlockReason] = useState<string>("");
  const [isTimelineModalOpen, setIsTimelineModalOpen] = useState(false);
  const [selectedDateForTimeline, setSelectedDateForTimeline] = useState<Date | null>(null);

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
    (date: Date) => {
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

  const openFreeSlotFromTimeline = useCallback(
    (day: Date, minuteY: number) => {
      const dayEvents = getEventsForDate(day);
      const busy = busyIntervalsFromDayEvents(day, dayEvents);
      const free = freeIntervalsFromBusy(busy);
      const range = computeTimelineFreeSlotRange(minuteY, free);
      if (!range) return;

      const normalizedStart = moment(day).startOf("day").toDate();
      const normalizedEnd = moment(day).startOf("day").hour(23).minute(59).second(0).millisecond(0).toDate();

      setSelectedSlot({ start: normalizedStart, end: normalizedEnd, isSameDay: true });
      setSelectedEvent(null);
      setIsEditing(false);
      setChooseAction(null);
      setCheckInTime(minuteOfDayToHHmm(range.slotStart));
      setCheckOutTime(exclusiveEndMinuteToCheckOutHHmm(range.slotEndExclusive));
      setBlockReason("");
      setIsOpen(true);
    },
    [getEventsForDate]
  );

  const handleSelectSlot = ({ start, end }: any) => {
    const actualEnd = new Date(end);
    actualEnd.setMilliseconds(actualEnd.getMilliseconds() - 1);
    
    const startDateOnly = moment(start).startOf('day');
    const endDateOnly = moment(actualEnd).startOf('day');
    const isSameDay = startDateOnly.isSame(endDateOnly, 'day');
    
    if (isSameDay) {
      const dayEvents = getEventsForDate(start);
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
    
    setSelectedSlot({ start: normalizedStart, end: normalizedEnd, isSameDay });
    setSelectedEvent(null);
    setIsEditing(false);
    setChooseAction(null);
    setCheckInTime("00:00");
    setCheckOutTime("23:59");
    setIsOpen(true);
  };

  const handleSelectEvent = (event: any) => {
    if (event.isBlocked) {
      setSelectedEvent(event);
      setSelectedSlot(null);
      setIsEditing(false);
      setChooseAction(null);
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
      alert("Please select both check-in and check-out times");
      return;
    }

    try {
      const startDate = combineDateTime(selectedSlot.start, checkInTime);
      const endDate = selectedSlot.isSameDay 
        ? combineDateTime(selectedSlot.start, checkOutTime)
        : combineDateTime(selectedSlot.end, checkOutTime);
      
      if (endDate < startDate) {
        alert("End time must be after or equal to start time");
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
        setCheckInTime("");
        setCheckOutTime("");
        setBlockReason("");
        await fetchBookings(false);
      } else {
        alert("Failed to block date. Please try again.");
      }
    } catch (error) {
      console.error("Error blocking date:", error);
      alert("Error blocking date. Please try again.");
    }
  };

  const combineDateTime = (date: Date, time: string): Date => {
    const combined = new Date(date);
    const [hours, minutes] = time.split(":").map(Number);
    combined.setHours(hours || 0, minutes || 0, 0, 0);
    return combined;
  };

  const getCurrentTimeRoundedForPicker = (): string => {
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    const remainder = minutes % 15;
    if (remainder !== 0) {
      minutes = minutes + (15 - remainder);
      if (minutes >= 60) {
        minutes = 0;
        hours = (hours + 1) % 24;
      }
    }
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  };

  const slotDateIsToday =
    !!selectedSlot && moment(selectedSlot.start).isSame(moment(), "day");

  const getMinStartTimeForPicker = (): string | undefined => {
    if (slotDateIsToday) return getCurrentTimeRoundedForPicker();
    return undefined;
  };

  const getMinEndTimeForPicker = (): string | undefined => {
    if (selectedSlot?.isSameDay && checkInTime) {
      const [hours, minutes] = checkInTime.split(":").map(Number);
      let newMinutes = (minutes || 0) + 15;
      let newHours = hours || 0;
      if (newMinutes >= 60) {
        newMinutes = 0;
        newHours = (newHours + 1) % 24;
      }
      return `${String(newHours).padStart(2, "0")}:${String(newMinutes).padStart(2, "0")}`;
    }
    return undefined;
  };

  const fetchBlockedDates = useCallback(async () => {
    if (!locationId) {
      return [];
    }

    try {
      const { status, response } = await getBlockedDates(locationId);
      
      if (status && response?.data) {
        const blockedEvents = Array.isArray(response.data) 
          ? response.data.map(transformBlockedDateToEvent)
          : [];
        return blockedEvents;
      }
      return [];
    } catch (error) {
      console.error("Error fetching blocked dates:", error);
      return [];
    }
  }, [locationId]);

  const fetchBookings = useCallback(async (showLoading = true) => {
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
      const queryParams: any = {
        locationId: locationId,
        status: ["confirmed"]
      };
      
      const [bookingsResult, blockedEvents, availabilityResult] = await Promise.all([
        getBookings(queryParams),
        fetchBlockedDates(),
        getAvailabilityRules(parseInt(locationId, 10)).catch(() => null),
      ]);

      if (availabilityResult && availabilityResult.status === 200 && availabilityResult.response?.data) {
        const data = availabilityResult.response.data as {
          blocked?: ApiAvailabilityBlockedItem[];
          schedule?: ApiAvailabilityBlockedItem[];
        };
        setPreparedRecurringBlockedRules(prepareRecurringBlockedRules(data.blocked));
        setPreparedScheduleRules(prepareScheduleRules(data.schedule));
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
  }, [locationId, fetchBlockedDates, needsLocationPicker, pickerInitDone]);

  const fetchLocations = useCallback(async () => {
    try {
      const { status, response } = await getBookingMetadata();
      if (status === 200 && response?.data?.locations) {
        if (locationId) {
          const currentLoc = response.data.locations.find(
            (loc: any) => loc.id === locationId || loc.id?.toString() === locationId
          );
          if (currentLoc) {
            setCurrentLocation(currentLoc.name || "Location");
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
          const list = (response.data.locations as any[]).map((loc) => ({
            id: loc.id != null ? String(loc.id) : "",
            name: loc.name ?? "Location",
          })).filter((l) => l.id);
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

  const [view, setView] = useState<View>(Views.MONTH);

  const handleViewChange = (newView: View) => {
    if (newView === Views.MONTH || newView === Views.WEEK || newView === Views.DAY) {
      setView(newView);
    }
  };

  const renderCalendar = (height: string) => (
    <div className="google-calendar-wrapper">
    <Calendar
      localizer={localizer}
      events={events}
      startAccessor="start"
      endAccessor="end"
      selectable
      onSelectSlot={handleSelectSlot}
      onSelectEvent={handleSelectEvent}
        view={view}
        onView={handleViewChange}
        views={[Views.MONTH, Views.WEEK, Views.DAY]}
      date={currentDate}
      onNavigate={(date) => setCurrentDate(date)}
      style={{ height }}
      popup
      dayLayoutAlgorithm="no-overlap"
      onShowMore={(_events, date) => {
        setSelectedDateForTimeline(date);
        setIsTimelineModalOpen(true);
      }}
        formats={{
          dayFormat: "D",
          weekdayFormat: (date, culture, localizer) =>
            localizer?.format(date, "ddd", culture) || "",
          monthHeaderFormat: (date, culture, localizer) =>
            localizer?.format(date, "MMMM YYYY", culture) || "",
        }}
      eventPropGetter={(event) => {
        let backgroundColor = "";
        if (event.isBlocked) {
            backgroundColor = "#5f6368";
        } else {
          switch (event.status) {
            case "Pending":
                backgroundColor = "#fbbc04";
              break;
            case "Active":
                backgroundColor = "#34a853";
              break;
            case "Cancelled":
                backgroundColor = "#ea4335";
              break;
            case "Finished":
                backgroundColor = "#4285f4";
              break;
            default:
                backgroundColor = "#5f6368";
            }
        }
        return {
          style: {
            backgroundColor,
            color: "white",
            fontSize: "12px",
              borderRadius: "3px",
              padding: "2px 6px",
              border: "none",
              fontWeight: 500,
              cursor: "pointer",
          },
        };
      }}
        components={{
          toolbar: (props) => {
            const titleDateLabel =
              view === Views.DAY
                ? moment(currentDate).format("dddd, D MMMM YYYY")
                : moment(currentDate).format("MMMM YYYY");

            return (
              <div className="calendar-toolbar-wrapper">
                <div className="calendar-toolbar">
                  <div className="calendar-toolbar-left">
                    <button
                      type="button"
                      onClick={() => props.onNavigate("PREV")}
                      className="calendar-nav-btn"
                      aria-label="Previous"
                    >
                      <ChevronLeft className="w-4 h-4" strokeWidth={2} />
                    </button>
                    <button
                      type="button"
                      onClick={() => props.onNavigate("TODAY")}
                      className="calendar-today-btn"
                    >
                      Today
                    </button>
                    <button
                      type="button"
                      onClick={() => props.onNavigate("NEXT")}
                      className="calendar-nav-btn"
                      aria-label="Next"
                    >
                      <ChevronRight className="w-4 h-4" strokeWidth={2} />
                    </button>
                  </div>

                  <div className="calendar-toolbar-center">
                    <h2 className="calendar-title">
                      {needsLocationPicker && locationOptions.length > 0 ? (
                        <>
                          <div className="calendar-toolbar-location-select">
                            <CustomSelect
                              value={{
                                value: pickerLocationId,
                                label:
                                  locationOptions.find((o) => o.value === pickerLocationId)?.label ?? "",
                              }}
                              onChange={(option: { value?: string } | null) => {
                                if (option?.value) setPickerLocationId(String(option.value));
                              }}
                              options={locationOptions}
                              placeholder="Select location"
                              isSearchable={false}
                            />
                          </div>
                          <span className="calendar-separator">•</span>
                          <span className="calendar-date">{titleDateLabel}</span>
                        </>
                      ) : (
                        <>
                          <span className="calendar-location">{currentLocation}</span>
                          <span className="calendar-separator">•</span>
                          <span className="calendar-date">{titleDateLabel}</span>
                        </>
                      )}
                    </h2>
                  </div>

                  <div className="calendar-toolbar-right">
                    <div className="calendar-view-selector">
                      <button
                        type="button"
                        onClick={() => {
                          handleViewChange(Views.MONTH);
                          props.onView(Views.MONTH);
                        }}
                        className={`calendar-view-btn ${view === Views.MONTH ? 'active' : ''}`}
                        title="Month view"
                      >
                        <LayoutGrid className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          handleViewChange(Views.WEEK);
                          props.onView(Views.WEEK);
                        }}
                        className={`calendar-view-btn ${view === Views.WEEK ? 'active' : ''}`}
                        title="Week view"
                      >
                        <CalendarLucide className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          handleViewChange(Views.DAY);
                          props.onView(Views.DAY);
                        }}
                        className={`calendar-view-btn ${view === Views.DAY ? 'active' : ''}`}
                        title="Day view"
                      >
                        <Clock className="w-4 h-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => fullscreen ? setFullscreen(false) : setFullscreen(true)}
                      className="calendar-maximize-btn"
                      aria-label={fullscreen ? "Minimize" : "Maximize"}
                      title={fullscreen ? "Exit fullscreen" : "Fullscreen"}
                    >
                      {fullscreen ? (
                        <Minimize2 className="w-4 h-4" />
                      ) : (
                        <Maximize2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          },
        }}
      />
    </div>
  );

  const formatDate = (date: Date) => {
    return moment(date).format("DD/MM/YYYY");
  };

  const formatDateTime = (date: Date) => {
    return moment(date).format("DD/MM/YYYY HH:mm");
  };

  const formatTime = (date: Date) => {
    return moment(date).format("HH:mm");
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
        alert("Failed to unblock date. Please try again.");
      }
    } catch (error) {
      console.error("Error unblocking date:", error);
      alert("Error unblocking date. Please try again.");
    }
  };

  const showPickerLoading = needsLocationPicker && !pickerInitDone;
  const showNoLocations = needsLocationPicker && pickerInitDone && locationsForPicker.length === 0;

  return (
    <div className="flex h-[calc(100vh-200px)] overflow-hidden">
      {/* Calendar Section */}
      <div className="flex flex-col w-full">
        <div className="google-calendar-container bg-white dark:bg-gray-900 h-full min-h-0 flex flex-col">
          <div className="flex min-h-0 flex-1 flex-col pb-6">
            {showPickerLoading ? (
              <div className="flex h-full min-h-0 flex-1 items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400">Loading locations...</p>
              </div>
            ) : showNoLocations ? (
              <div className="flex h-full min-h-0 flex-1 items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400">No locations available.</p>
              </div>
            ) : loading ? (
              <div className="flex h-full min-h-0 flex-1 items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400">Loading bookings...</p>
              </div>
            ) : (
              <div className="flex min-h-0 flex-1 flex-col">{renderCalendar("100%")}</div>
            )}
          </div>
        </div>
      </div>

      {/* Blocked Date Modal */}
      <Dialog open={selectedEvent !== null && selectedEvent.isBlocked && !isEditing} onClose={() => {
        setSelectedEvent(null);
        setIsOpen(false);
      }} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-2xl rounded-lg bg-white dark:bg-gray-800 shadow-lg">
            {selectedEvent && selectedEvent.isBlocked && (() => {
              const startMoment = moment(selectedEvent.start);
              const endMoment = moment(selectedEvent.end);
              const isSameDay = startMoment.isSame(endMoment, 'day');
              const isStartMidnight = startMoment.hour() === 0 && startMoment.minute() === 0 && startMoment.second() === 0;
              const endOfDay = endMoment.clone().endOf('day');
              const isEndEndOfDay = endMoment.isSameOrAfter(endOfDay.subtract(1, 'minute'));
              const isEntireDay = isSameDay && isStartMidnight && isEndEndOfDay;
              const isRecurring = !!selectedEvent.isRecurringRuleBlock;
              const isScheduleClosed = !!selectedEvent.isScheduleClosed;
              
              return (
                <>
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {isScheduleClosed
                          ? (selectedEvent.title || "Program")
                          : isRecurring
                            ? "Blocare recurentă (reguli disponibilitate)"
                            : "Blocked Date"}
                      </Dialog.Title>
                      <button
                        onClick={() => {
                          setSelectedEvent(null);
                          setIsOpen(false);
                        }}
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

                        {isScheduleClosed && selectedEvent.schedulePeriodNote && (
                          <div className="flex items-start gap-3">
                            <CalendarIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Perioadă regulă</p>
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {selectedEvent.schedulePeriodNote}
                              </p>
                            </div>
                          </div>
                        )}

                        {isRecurring && selectedEvent.recurrencePeriodNote && (
                          <div className="flex items-start gap-3">
                            <CalendarIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Perioadă activă</p>
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {selectedEvent.recurrencePeriodNote}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Fără date în API înseamnă permanent, pe zilele setate în regulă. Cu date, se aplică doar între acel interval.
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
                              {isEntireDay 
                                ? formatDate(selectedEvent.start)
                                : formatDateTime(selectedEvent.start)
                              }
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
                              {isEntireDay 
                                ? formatDate(selectedEvent.end)
                                : formatDateTime(selectedEvent.end)
                              }
                            </p>
                          </div>
                        </div>

                        {!isEntireDay && (
                          <div className="flex items-center gap-3">
                            <Clock className="w-5 h-5 text-gray-400" />
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Interval orar</p>
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {formatTime(selectedEvent.start)} - {formatTime(selectedEvent.end)}
                              </p>
                            </div>
                          </div>
                        )}

                        {selectedEvent.reason && (
                          <div className="flex items-start gap-3">
                            <div className="w-5 h-5 flex items-center justify-center mt-0.5">
                              <span className="text-gray-400">📝</span>
                            </div>
                            <div className="flex-1">
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Motiv</p>
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {selectedEvent.reason}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {!isRecurring && !isScheduleClosed && (
                      <div className="mt-6 flex justify-end">
                        <button
                          onClick={handleUnblockDate}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                        >
                          Unblock
                        </button>
                      </div>
                    )}
                  </div>
                </>
              );
            })()}
          </Dialog.Panel>
        </div>
      </Dialog>

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

      <Dialog open={fullscreen} onClose={() => setFullscreen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center">
          <Dialog.Panel className="flex h-full w-full min-h-0 flex-col bg-white dark:bg-gray-900">
            <div className="flex min-h-0 flex-1 flex-col p-6">
              {renderCalendar("100%")}
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      <Dialog open={isOpen && (!selectedEvent || isEditing)} onClose={() => {
        setIsOpen(false);
        setCheckInTime("");
        setCheckOutTime("");
        setBlockReason("");
      }} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-lg rounded-lg bg-white dark:bg-gray-800 p-6 shadow-lg time-selection-modal">
            {!chooseAction && !selectedEvent && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    What do you want to do?
                  </Dialog.Title>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      setCheckInTime("");
                      setCheckOutTime("");
                      setBlockReason("");
                    }}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    aria-label="Close"
                  >
                    <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  </button>
                </div>
                
                {selectedSlot && (
                  <div className="selected-date-display">
                    <p className="date-label">
                      <span className="font-medium flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4" />
                        Selected Date:
                      </span>
                    </p>
                    <p className="date-value">
                      {selectedSlot.isSameDay 
                        ? formatDate(selectedSlot.start)
                        : `${formatDate(selectedSlot.start)} - ${formatDate(selectedSlot.end)}`
                      }
                    </p>
                  </div>
                )}

                <div className="space-y-4 mb-4">
                  <CustomTimePicker
                    label="START TIME"
                    value={checkInTime}
                    onChange={setCheckInTime}
                    iconLeft={<Clock className="w-4 h-4 text-gray-400" />}
                    required
                    minTime={getMinStartTimeForPicker()}
                    autoFillEmptyOnMount={false}
                    include2359Option
                  />
                  <CustomTimePicker
                    label="END TIME"
                    value={checkOutTime}
                    onChange={setCheckOutTime}
                    iconLeft={<Clock className="w-4 h-4 text-gray-400" />}
                    required
                    minTime={getMinEndTimeForPicker()}
                    autoFillEmptyOnMount={false}
                    include2359Option
                  />
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      Reason (Optional)
                    </label>
                    <CustomTextarea
                      label=""
                      value={blockReason}
                      onChange={(e) => setBlockReason(e.target.value)}
                      placeholder="Enter reason for blocking this date..."
                      rows={3}
                    />
                  </div>
                </div>

                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => {
                      if (!selectedSlot || !checkInTime || !checkOutTime) {
                        alert("Please select both check-in and check-out times");
                        return;
                      }
                      const startDateTime = combineDateTime(selectedSlot.start, checkInTime);
                      const endDateTime = selectedSlot.isSameDay 
                        ? combineDateTime(selectedSlot.start, checkOutTime)
                        : combineDateTime(selectedSlot.end, checkOutTime);
                      if (endDateTime <= startDateTime) {
                        alert("End time must be after start time");
                        return;
                      }
                      setIsOpen(false);
                      setIsModalNewBooking(true);
                    }}
                    className="btn-primary"
                  >
                    Add Booking
                  </button>
                  <button
                    onClick={handleBlockDate}
                    className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                  >
                    Block Date
                  </button>
                </div>
              </div>
            )}

          </Dialog.Panel>
        </div>
      </Dialog>

      <CustomModal
        open={isModalNewBooking}
        onClose={async () => {
          setIsModalNewBooking(false);
          setCheckInTime("");
          setCheckOutTime("");
          await fetchBookings(false);
        }}
        title="Create Booking"
      >
        <BookingFormBun
          slug="new"
          initialCheckIn={selectedSlot && checkInTime ? combineDateTime(selectedSlot.start, checkInTime).toISOString() : undefined}
          initialCheckOut={selectedSlot && checkOutTime 
            ? (selectedSlot.isSameDay 
                ? combineDateTime(selectedSlot.start, checkOutTime).toISOString()
                : combineDateTime(selectedSlot.end, checkOutTime).toISOString())
            : undefined}
        />
      </CustomModal>

      <Dialog 
        open={isTimelineModalOpen} 
        onClose={() => {
          setIsTimelineModalOpen(false);
          setSelectedDateForTimeline(null);
        }} 
        className="relative z-40"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-3xl rounded-lg bg-white dark:bg-gray-800 shadow-lg max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {selectedDateForTimeline && (
                    <>
                      <span className="flex items-center gap-2">
                        <CalendarIcon className="w-5 h-5" />
                        {formatDate(selectedDateForTimeline)}
                      </span>
                    </>
                  )}
                </Dialog.Title>
                <button
                  onClick={() => {
                    setIsTimelineModalOpen(false);
                    setSelectedDateForTimeline(null);
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {selectedDateForTimeline && (
                <div className="relative px-2 py-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 text-center">
                    Click pe o oră liberă în grilă sau pe eticheta orei pentru rezervare sau blocare.
                  </p>
                  <div className="timeline-time-labels">
                    {Array.from({ length: 24 }, (_, i) => (
                      <button
                        key={i}
                        type="button"
                        className="timeline-time-label w-full border-0 bg-transparent text-right"
                        title={`Selectează intervalul liber la ${i.toString().padStart(2, "0")}:00`}
                        onClick={(e) => {
                          e.stopPropagation();
                          openFreeSlotFromTimeline(selectedDateForTimeline, i * 60);
                        }}
                      >
                        {i.toString().padStart(2, "0")}:00
                      </button>
                    ))}
                  </div>
                  <div
                    className="timeline-container"
                    onClick={(e) => {
                      if (e.target !== e.currentTarget) return;
                      const y = (e.nativeEvent as MouseEvent).offsetY;
                      openFreeSlotFromTimeline(selectedDateForTimeline, y);
                    }}
                  >
                    {getEventsForDate(selectedDateForTimeline)
                        .sort((a, b) => {
                          const timeA = moment(a.start).valueOf();
                          const timeB = moment(b.start).valueOf();
                          return timeA - timeB;
                        })
                        .map((event, index) => {
                          const startTime = moment(event.start).format("HH:mm");
                          const endTime = moment(event.end).format("HH:mm");
                          
                          const dayStart = moment(selectedDateForTimeline).startOf('day');
                          const dayEnd = moment(selectedDateForTimeline).endOf('day');
                          const eventStart = moment(event.start);
                          const eventEnd = moment(event.end);
                          const now = moment();
                          
                          const continuesToNextDay = eventEnd.isAfter(dayEnd);
                          
                          const minutesFromStart = eventStart.isBefore(dayStart) 
                            ? 0 
                            : eventStart.diff(dayStart, 'minutes');
                          
                          const effectiveEnd = continuesToNextDay ? dayEnd : eventEnd;
                          const duration = effectiveEnd.diff(eventStart.isBefore(dayStart) ? dayStart : eventStart, 'minutes');
                          const heightPx = Math.max(50, duration);
                          
                          const topPositionPx = Math.max(0, minutesFromStart);
                          
                          const hasPassed = eventEnd.isBefore(now);
                          
                          let continuationMessage = null;
                          if (continuesToNextDay) {
                            const nextDayEndTime = eventEnd.format("HH:mm");
                            const nextDay = moment(eventEnd).startOf('day');
                            const tomorrow = moment(selectedDateForTimeline).add(1, 'day').startOf('day');
                            
                            if (nextDay.isSame(tomorrow, 'day')) {
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
                              className="timeline-event-item"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (event.isBlocked) {
                                  setSelectedEvent(event);
                                  setIsTimelineModalOpen(false);
                                  setIsOpen(true);
                                } else {
                                  setSelectedBookingId(event.id);
                                  setIsTimelineModalOpen(false);
                                  setIsModalOpen(true);
                                }
                              }}
                              style={{
                                backgroundColor,
                                top: `${Math.max(0, topPositionPx)}px`,
                                height: `${heightPx}px`,
                              }}
                            >
                              <div className="timeline-event-content">
                                {continuationMessage && (
                                  <div className="timeline-event-continuation">
                                    <span className="continuation-text">
                                      {continuationMessage}
                                    </span>
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
                                </div>
                              </div>
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
    </div>
  );
};

export default CalendarLocation;
