import moment from "moment";
import { Views } from "react-big-calendar";
import { ChevronLeft, ChevronRight, Maximize2, Minimize2 } from "lucide-react";
import CustomSelect from "../shared/CustomSelect";

const CalendarHeader = ({
  onNavigate,
  onView,
  view,
  currentDate,
  needsLocationPicker,
  locationOptions,
  pickerLocationId,
  onPickerLocationChange,
  currentLocation,
  fullscreen,
  onToggleFullscreen,
}) => {
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
            onClick={() => onNavigate("PREV")}
            className="calendar-nav-btn"
            aria-label="Previous"
          >
            <ChevronLeft className="w-4 h-4" strokeWidth={2} />
          </button>
          <button
            type="button"
            onClick={() => onNavigate("TODAY")}
            className="calendar-today-btn"
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => onNavigate("NEXT")}
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
                      label: locationOptions.find((o) => o.value === pickerLocationId)?.label ?? "",
                    }}
                    onChange={(option) => {
                      if (option?.value) onPickerLocationChange(String(option.value));
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
              onClick={() => onView(Views.MONTH)}
              className={`calendar-view-btn ${view === Views.MONTH ? "active" : ""}`}
              title="Month view"
            >
              Lună
            </button>
            <button
              type="button"
              onClick={() => onView(Views.WEEK)}
              className={`calendar-view-btn ${view === Views.WEEK ? "active" : ""}`}
              title="Week view"
            >
              Săptămână
            </button>
            <button
              type="button"
              onClick={() => onView(Views.DAY)}
              className={`calendar-view-btn ${view === Views.DAY ? "active" : ""}`}
              title="Day view"
            >
              Zi
            </button>
          </div>
          <button
            onClick={onToggleFullscreen}
            className="calendar-maximize-btn"
            aria-label={fullscreen ? "Minimize" : "Maximize"}
            title={fullscreen ? "Exit fullscreen" : "Fullscreen"}
          >
            {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalendarHeader;
