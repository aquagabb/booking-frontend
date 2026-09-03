import moment from "moment";
import { Calendar, Views } from "react-big-calendar";
import CalendarHeader from "./CalendarHeader";

const CalendarEventContent = ({ event }) => (
  <div className="calendar-event-content">
    <span className="calendar-event-title">{event.title}</span>
    <span className="calendar-event-time">
      {moment(event.start).format("HH:mm")} - {moment(event.end).format("HH:mm")}
    </span>
  </div>
);

const eventBackgroundColor = (event) => {
  if (event.isBlocked) return "#5f6368";
  switch (event.status) {
    case "Pending":
      return "#fbbc04";
    case "Active":
      return "#34a853";
    case "Cancelled":
      return "#ea4335";
    case "Finished":
      return "#4285f4";
    default:
      return "#5f6368";
  }
};

const calendarMessages = {
  date: "Dată",
  time: "Ora",
  event: "Eveniment",
  allDay: "Toată ziua",
  week: "Săptămână",
  work_week: "Săptămână lucrătoare",
  day: "Zi",
  month: "Lună",
  previous: "Anterior",
  next: "Următor",
  yesterday: "Ieri",
  tomorrow: "Mâine",
  today: "Astăzi",
  agenda: "Agendă",
  noEventsInRange: "Nu există evenimente în acest interval.",
  showMore: (total) => `+${total} în plus`,
};

const CalendarGrid = ({
  localizer,
  events,
  view,
  onViewChange,
  currentDate,
  onNavigateDate,
  onSelectSlot,
  onSelectEvent,
  onShowMore,
  height,
  needsLocationPicker,
  locationOptions,
  pickerLocationId,
  onPickerLocationChange,
  currentLocation,
  fullscreen,
  onToggleFullscreen,
}) => {
  return (
    <div className="google-calendar-wrapper">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        selectable
        onSelectSlot={onSelectSlot}
        onSelectEvent={onSelectEvent}
        view={view}
        onView={onViewChange}
        views={[Views.MONTH, Views.WEEK, Views.DAY]}
        date={currentDate}
        onNavigate={onNavigateDate}
        style={{ height }}
        popup
        dayLayoutAlgorithm="no-overlap"
        onShowMore={onShowMore}
        messages={calendarMessages}
        formats={{
          dayFormat: "D",
          weekdayFormat: (date, culture, fmtLocalizer) =>
            fmtLocalizer?.format(date, "ddd", culture) || "",
          monthHeaderFormat: (date, culture, fmtLocalizer) =>
            fmtLocalizer?.format(date, "MMMM YYYY", culture) || "",
        }}
        eventPropGetter={(event) => ({
          style: {
            backgroundColor: eventBackgroundColor(event),
            color: "white",
            fontSize: "12px",
            borderRadius: "3px",
            padding: "2px 6px",
            border: "none",
            fontWeight: 500,
            cursor: "pointer",
          },
        })}
        components={{
          event: CalendarEventContent,
          toolbar: (rbcProps) => (
            <CalendarHeader
              {...rbcProps}
              view={view}
              currentDate={currentDate}
              needsLocationPicker={needsLocationPicker}
              locationOptions={locationOptions}
              pickerLocationId={pickerLocationId}
              onPickerLocationChange={onPickerLocationChange}
              currentLocation={currentLocation}
              fullscreen={fullscreen}
              onToggleFullscreen={onToggleFullscreen}
            />
          ),
        }}
      />
    </div>
  );
};

export default CalendarGrid;
