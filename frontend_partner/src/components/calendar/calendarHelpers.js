import moment from "moment";
import { segmentsForTimedRuleOnCalendarDay } from "../calendarRecurringBlocks";

export const DAY_MINUTES = 24 * 60;
export const TIMELINE_COMPACT_THRESHOLD_MIN = 60;
export const TIMELINE_COMPACT_HEIGHT_PX = 40;

const STATUS_MAP = {
  confirmed: "Active",
  pending: "Pending",
  cancelled: "Cancelled",
  completed: "Finished",
};

export const mapStatus = (backendStatus) => STATUS_MAP[backendStatus] || "Pending";

export const transformBookingToEvent = (booking) => {
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

export const transformBlockedDateToEvent = (blockedDate) => {
  const startDate = new Date(blockedDate.startDate);
  const endDate = new Date(blockedDate.endDate);

  const startDay = moment(startDate).startOf("day");
  const endDay = moment(endDate).startOf("day");
  const isSameDay = startDay.isSame(endDay, "day");
  const isStartMidnight = moment(startDate).format("HH:mm:ss") === "00:00:00";
  const isEndMidnight = moment(endDate).format("HH:mm:ss") === "00:00:00";

  if (isSameDay && isStartMidnight && isEndMidnight) {
    const blockedDay = moment(startDate).startOf("day").toDate();
    const blockedDayEnd = moment(startDate).endOf("day").toDate();

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

function mergeBusyIntervalsMinutes(segments) {
  if (!segments.length) return [];
  const sorted = [...segments].sort((a, b) => a.start - b.start);
  const out = [];
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
export function busyIntervalsFromDayEvents(day, dayEvents) {
  const dayStart = moment(day).startOf("day");
  const dayEnd = moment(day).endOf("day");
  const raw = [];
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

/** window = { startMinutes, endMinutes } limitează calculul la programul de disponibilitate; implicit e toată ziua */
export function freeIntervalsFromBusy(busy, window) {
  const rangeStart = window ? window.startMinutes : 0;
  const rangeEnd = window ? window.endMinutes : DAY_MINUTES;
  const free = [];
  let cur = rangeStart;
  for (const b of busy) {
    const busyStart = Math.max(b.start, rangeStart);
    const busyEnd = Math.min(b.end, rangeEnd);
    if (busyStart >= busyEnd) continue;
    if (busyStart > cur) free.push({ start: cur, end: busyStart });
    cur = Math.max(cur, busyEnd);
  }
  if (cur < rangeEnd) free.push({ start: cur, end: rangeEnd });
  return free;
}

function findFreeIntervalContaining(free, minute) {
  const m = Math.min(Math.max(0, Math.floor(minute)), DAY_MINUTES - 1);
  return free.find((f) => m >= f.start && m < f.end) ?? null;
}

/** Returnează start (minute) și sfârșit exclusiv, sau null dacă nu e timp liber */
export function computeTimelineFreeSlotRange(clickedMinuteFromTop, free) {
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

export function minuteOfDayToHHmm(minute) {
  const m = Math.min(Math.max(0, Math.floor(minute)), DAY_MINUTES - 1);
  const h = Math.floor(m / 60);
  const min = m % 60;
  return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}

/** Sfârșit exclusiv în minute → ora afișată ca check-out (ex. 720 → 12:00) */
export function exclusiveEndMinuteToCheckOutHHmm(endExclusive) {
  if (endExclusive >= DAY_MINUTES) return "23:59";
  const h = Math.floor(endExclusive / 60);
  const m = endExclusive % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Construiește mapare minut-real -> pixel-afișat, comprimând intervalele închise lungi la o bandă fixă */
export function buildTimelineDayLayout(compactRanges) {
  const segments = [];
  let cursor = 0;
  let dispCursor = 0;

  for (const range of compactRanges) {
    if (range.start > cursor) {
      const len = range.start - cursor;
      segments.push({ realStart: cursor, realEnd: range.start, dispStart: dispCursor, dispEnd: dispCursor + len });
      dispCursor += len;
    }
    segments.push({
      realStart: range.start,
      realEnd: range.end,
      dispStart: dispCursor,
      dispEnd: dispCursor + TIMELINE_COMPACT_HEIGHT_PX,
    });
    dispCursor += TIMELINE_COMPACT_HEIGHT_PX;
    cursor = Math.max(cursor, range.end);
  }

  if (cursor < DAY_MINUTES) {
    const len = DAY_MINUTES - cursor;
    segments.push({ realStart: cursor, realEnd: DAY_MINUTES, dispStart: dispCursor, dispEnd: dispCursor + len });
    dispCursor += len;
  }

  return { segments, totalHeightPx: dispCursor };
}

export function mapMinuteToDisplayY(layout, minute) {
  const m = Math.min(Math.max(0, minute), DAY_MINUTES);
  for (const seg of layout.segments) {
    if (m >= seg.realStart && m <= seg.realEnd) {
      const realLen = seg.realEnd - seg.realStart;
      const frac = realLen > 0 ? (m - seg.realStart) / realLen : 0;
      return seg.dispStart + frac * (seg.dispEnd - seg.dispStart);
    }
  }
  return layout.totalHeightPx;
}

export function mapDisplayYToMinute(layout, y) {
  const clampedY = Math.min(Math.max(0, y), layout.totalHeightPx);
  for (const seg of layout.segments) {
    if (clampedY >= seg.dispStart && clampedY <= seg.dispEnd) {
      const dispLen = seg.dispEnd - seg.dispStart;
      const frac = dispLen > 0 ? (clampedY - seg.dispStart) / dispLen : 0;
      return seg.realStart + frac * (seg.realEnd - seg.realStart);
    }
  }
  return DAY_MINUTES;
}

export const formatDate = (date) => moment(date).format("DD/MM/YYYY");
export const formatDateTime = (date) => moment(date).format("DD/MM/YYYY HH:mm");
export const formatTime = (date) => moment(date).format("HH:mm");

export const combineDateTime = (date, time) => {
  const combined = new Date(date);
  const [hours, minutes] = time.split(":").map(Number);
  combined.setHours(hours || 0, minutes || 0, 0, 0);
  return combined;
};

export const getCurrentTimeRoundedForPicker = () => {
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

export const hhmmToMinutes = (hhmm) => {
  if (!hhmm) return null;
  const [h, m] = hhmm.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
};

/**
 * Interval orar deschis pentru o zi conform programului de disponibilitate.
 * Returnează undefined dacă nu există reguli sau ziua nu e acoperită de nicio regulă (nerestricționat).
 */
export function getScheduleOpenWindowForDay(day, scheduleRules) {
  if (!scheduleRules || !scheduleRules.length) return undefined;

  const dayMoment = moment(day);
  const dayStart = dayMoment.clone().startOf("day");
  const segments = scheduleRules.flatMap((rule) => segmentsForTimedRuleOnCalendarDay(dayMoment, rule));
  if (!segments.length) return undefined;

  let startMinutes = DAY_MINUTES;
  let endMinutes = 0;
  segments.forEach((seg) => {
    const s = Math.max(0, seg.start.diff(dayStart, "minutes"));
    const e = Math.min(DAY_MINUTES, seg.end.diff(dayStart, "minutes"));
    if (s < startMinutes) startMinutes = s;
    if (e > endMinutes) endMinutes = e;
  });

  return { startMinutes, endMinutes };
}

/** window undefined = nerestricționat (fără reguli pentru ziua respectivă) */
export function isTimeWithinScheduleWindow(hhmm, window) {
  if (!window) return true;
  const minutes = hhmmToMinutes(hhmm);
  if (minutes === null) return false;
  return minutes >= window.startMinutes && minutes <= window.endMinutes;
}

export const formatEventTimeRange = (event) =>
  `${moment(event.start).format("HH:mm")} - ${moment(event.end).format("HH:mm")}`;

export const formatMinuteRange = (range) =>
  `${minuteOfDayToHHmm(range.start)} - ${exclusiveEndMinuteToCheckOutHHmm(range.end)}`;
