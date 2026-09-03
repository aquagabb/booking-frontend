import moment from "moment";
import { Plus, Users, Settings, Globe, Link2 } from "lucide-react";

const CalendarSidebar = ({
  today,
  todayEvents,
  todayAvailabilityText,
  onSelectEvent,
  onQuickAddEvent,
  onQuickBlockDay,
  onGoToAvailabilitySettings,
  locationId,
}) => {
  const publicCalendarUrl = locationId
    ? `${window.location.origin}/public-calendar/${locationId}`
    : null;

  const handleViewPublicCalendar = () => {
    if (!publicCalendarUrl) return;
    window.open(publicCalendarUrl, "_blank", "noopener,noreferrer");
  };

  const handleExportCalendarLink = async () => {
    if (!publicCalendarUrl) return;
    try {
      await navigator.clipboard.writeText(publicCalendarUrl);
      alert("Link-ul calendarului public a fost copiat!");
    } catch (error) {
      console.error("Error copying public calendar link:", error);
      alert(publicCalendarUrl);
    }
  };

  return (
    <div className="flex flex-col w-1/5 min-w-[240px] h-full min-h-0 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          Ziua de azi
        </p>
        <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-1 capitalize">
          {moment(today).format("D MMMM YYYY")}
        </p>
        {todayAvailabilityText && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
           {todayAvailabilityText}
          </p>
        )}
      </div>

      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-1 min-h-0 overflow-y-auto">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
          Evenimente in aceasta zi
        </p>
        {todayEvents.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500">Niciun eveniment astazi.</p>
        ) : (
          <div className="space-y-2">
            {todayEvents.map((event, index) => (
              <button
                key={event.id || index}
                type="button"
                onClick={() => onSelectEvent(event)}
                className="w-full text-left rounded-lg border border-gray-200 dark:border-gray-700 p-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: event.isBlocked ? "#5f6368" : "#34a853" }}
                  />
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    {moment(event.start).format("HH:mm")} - {moment(event.end).format("HH:mm")}
                  </span>
                  {!event.isBlocked && !!event.guests && (
                    <span className="ml-auto flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                      <Users className="w-3 h-3" />
                      {event.guests}
                    </span>
                  )}
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1 truncate">
                  {event.title || event.eventName || "Eveniment"}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="p-4">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
          Actiuni rapide
        </p>
        <div className="space-y-2">
          <button
            type="button"
            onClick={onQuickAddEvent}
            disabled={!locationId}
            className="btn-primary w-full flex items-center justify-center gap-2 text-sm disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            Adauga eveniment
          </button>
          <button
            type="button"
            onClick={onQuickBlockDay}
            disabled={!locationId}
            className="w-full flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            Blocheaza ziua
          </button>
          <button
            type="button"
            onClick={onGoToAvailabilitySettings}
            disabled={!locationId}
            className="w-full flex items-center gap-2 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Pentru blocari recurente, configureaza programul locatiei"
          >
            <Settings className="w-4 h-4" />
            Reguli de disponibilitate
          </button>
        </div>
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
          Calendar public
        </p>
        <div className="space-y-2">
          <button
            type="button"
            onClick={handleViewPublicCalendar}
            disabled={!locationId}
            className="w-full flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Globe className="w-4 h-4" />
            Vezi calendar public
          </button>
          <button
            type="button"
            onClick={handleExportCalendarLink}
            disabled={!locationId}
            className="w-full flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Link2 className="w-4 h-4" />
            Exporta calendar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalendarSidebar;
