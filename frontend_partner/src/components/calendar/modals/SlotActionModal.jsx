import { Dialog } from "@headlessui/react";
import { AlertTriangle, CalendarIcon, Clock, X } from "lucide-react";
import CustomTextarea from "../../shared/CustomTextarea";
import CustomTimePicker from "../../shared/CustomTimePicker";
import CustomDatePicker from "../../shared/CustomDatePicker";

const MODAL_TITLES = {
  full: "Ce dorești să faci?",
  block: "Blochează o perioadă",
  add: "Adaugă un eveniment",
};

const SlotActionModal = ({
  open,
  onClose,
  selectedSlot,
  onStartDateChange,
  onEndDateChange,
  checkInTime,
  setCheckInTime,
  checkOutTime,
  setCheckOutTime,
  blockReason,
  setBlockReason,
  minStartTime,
  maxStartTime,
  minEndTime,
  maxEndTime,
  scheduleHint,
  dayHasEvents,
  dayAvailabilityPanels = [],
  onAddBooking,
  onBlockDate,
  mode = "full",
}) => {
  const showAddBooking = mode === "full" || mode === "add";
  const showBlockDate = mode === "full" || mode === "block";

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-lg rounded-lg bg-white dark:bg-gray-800 p-6 shadow-lg time-selection-modal">
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {MODAL_TITLES[mode]}
              </Dialog.Title>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                aria-label="Închide"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <CustomDatePicker
                label="Data început"
                selected={selectedSlot?.start ?? null}
                onChange={onStartDateChange}
                iconLeft={<CalendarIcon className="w-4 h-4 text-gray-400" />}
                required
                dayClassName={(date) => (dayHasEvents?.(date) ? "day-has-events" : undefined)}
              />
              <CustomDatePicker
                label="Data sfârșit"
                selected={selectedSlot?.end ?? null}
                onChange={onEndDateChange}
                iconLeft={<CalendarIcon className="w-4 h-4 text-gray-400" />}
                minDate={selectedSlot?.start ?? undefined}
                required
                dayClassName={(date) => (dayHasEvents?.(date) ? "day-has-events" : undefined)}
              />
            </div>

            {dayAvailabilityPanels.length > 0 && (
              <p className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                <span className="inline-block w-2 h-2 rounded-full bg-accent flex-shrink-0" />
                Zilele marcate au deja evenimente
              </p>
            )}

            {scheduleHint && (
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{scheduleHint}</p>
            )}

            {dayAvailabilityPanels.map((panel, panelIndex) => (
              <div
                key={panelIndex}
                className="rounded-lg bg-accent/10 px-3 py-2.5 space-y-2"
              >
                <p className="flex items-center gap-1.5 text-xs font-semibold text-accent">
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                  {panel.label ? `${panel.label}: are deja evenimente` : "Această zi are deja evenimente"}
                </p>
                <ul className="space-y-1">
                  {panel.events.map((eventText, eventIndex) => (
                    <li
                      key={eventIndex}
                      className="text-xs text-gray-700 dark:text-gray-300 pl-1"
                    >
                      <span className="text-accent font-semibold mr-1">+</span>
                      {eventText}
                    </li>
                  ))}
                </ul>
                {panel.freeIntervalsText && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 pt-1.5 border-t border-accent/20">
                    Intervale disponibile: {panel.freeIntervalsText}
                  </p>
                )}
              </div>
            ))}

            <div className="space-y-4 mb-4">
              <CustomTimePicker
                label="ORA ÎNCEPUT"
                value={checkInTime}
                onChange={setCheckInTime}
                iconLeft={<Clock className="w-4 h-4 text-gray-400" />}
                required
                minTime={minStartTime}
                maxTime={maxStartTime}
                autoFillEmptyOnMount={false}
                include2359Option
              />
              <CustomTimePicker
                label="ORA SFÂRȘIT"
                value={checkOutTime}
                onChange={setCheckOutTime}
                iconLeft={<Clock className="w-4 h-4 text-gray-400" />}
                required
                minTime={minEndTime}
                maxTime={maxEndTime}
                autoFillEmptyOnMount={false}
                include2359Option
              />
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Motiv (opțional)
                </label>
                <CustomTextarea
                  label=""
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  placeholder="Introdu motivul..."
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <button
                onClick={onClose}
                className="rounded border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Renunță
              </button>
              {showAddBooking && (
                <button onClick={onAddBooking} className="btn-primary">
                  Adaugă rezervare
                </button>
              )}
              {showBlockDate && (
                <button
                  onClick={onBlockDate}
                  className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                >
                  Blochează
                </button>
              )}
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default SlotActionModal;
