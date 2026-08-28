import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, Calendar, ChevronRight, MapPin, Plus, Trash2 } from 'lucide-react';
import CustomModal from '../../../../components/shared/Modals/CustomModal';
import ConfirmModal from '../../../../components/shared/Modals/ConfirmModal';
import CustomDatePicker from '../../../../components/shared/CustomDatePicker';
import CustomRadioButton from '../../../../components/shared/CustomRadioButton';
import { formatDateRomanian } from '../../../../lib/utils';
import { getReminders, createReminder, updateReminder, deleteReminder } from '../../../../api/others/others';
import { getBookings } from '../../../../api/bookings/bookings';
import { getLocations } from '../../../../api/locations/locations';

type ReminderType = 'general' | 'booking' | 'location';

type ApiReminder = {
  id: number;
  userId: number;
  organizationId: number;
  type: ReminderType;
  itemId: number | string | null;
  description: string;
  remindAt: string;
  sentAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type ReminderTarget =
  | { type: 'general' }
  | { type: 'booking'; code: string; label: string }
  | { type: 'location'; id: string; slug: string; label: string };

type BookingOption = { id: number; code: string; label: string };
type LocationOption = { id: string; slug: string; label: string };

const getReminderTarget = (
  reminder: ApiReminder,
  bookingOptions: BookingOption[],
  locationOptions: LocationOption[]
): ReminderTarget => {
  if (reminder.type === 'booking' && reminder.itemId != null) {
    const booking = bookingOptions.find((b) => String(b.id) === String(reminder.itemId));
    if (booking) return { type: 'booking', code: booking.code, label: booking.label };
  }
  if (reminder.type === 'location' && reminder.itemId != null) {
    const location = locationOptions.find((l) => String(l.id) === String(reminder.itemId));
    if (location) return { type: 'location', id: location.id, slug: location.slug, label: location.label };
  }
  return { type: 'general' };
};

const TargetBadge = ({ target }: { target: ReminderTarget }) => {
  if (target.type === 'booking') {
    return (
      <Link
        to={`/partner/bookings/edit/${target.code}`}
        onClick={(e) => e.stopPropagation()}
        className="inline-flex items-center gap-1 text-xs text-primary bg-primary/10 hover:bg-primary/20 rounded-full px-2 py-0.5 mt-1 transition-colors"
      >
        <Calendar className="w-3 h-3" aria-hidden />
        {target.label}
      </Link>
    );
  }
  if (target.type === 'location') {
    return (
      <Link
        to={`/partner/properties/edit/${target.id}-${target.slug}?tab=overview`}
        onClick={(e) => e.stopPropagation()}
        className="inline-flex items-center gap-1 text-xs text-accent bg-accent/10 hover:bg-accent/20 rounded-full px-2 py-0.5 mt-1 transition-colors"
      >
        <MapPin className="w-3 h-3" aria-hidden />
        {target.label}
      </Link>
    );
  }
  return null;
};

const AddReminderModal = ({
  open,
  onClose,
  onAdd,
  bookingOptions,
  isLoadingBookings,
  locationOptions,
  isLoadingLocations,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (payload: {
    type: ReminderType;
    itemId: number | string | null;
    description: string;
    remindAt: string;
  }) => Promise<void>;
  bookingOptions: BookingOption[];
  isLoadingBookings: boolean;
  locationOptions: LocationOption[];
  isLoadingLocations: boolean;
}) => {
  const [targetType, setTargetType] = useState<ReminderType>('general');
  const [text, setText] = useState('');
  const [date, setDate] = useState<Date | null>(null);
  const [selectedBookingId, setSelectedBookingId] = useState('');
  const [selectedLocationId, setSelectedLocationId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetAndClose = () => {
    setTargetType('general');
    setText('');
    setDate(null);
    setSelectedBookingId('');
    setSelectedLocationId('');
    onClose();
  };

  const isValid =
    text.trim().length > 0 &&
    date !== null &&
    (targetType === 'general' ||
      (targetType === 'booking' && selectedBookingId) ||
      (targetType === 'location' && selectedLocationId));

  const handleSubmit = async () => {
    if (!isValid || !date) return;

    const itemId =
      targetType === 'booking'
        ? Number(selectedBookingId)
        : targetType === 'location'
          ? selectedLocationId
          : null;

    try {
      setIsSubmitting(true);
      await onAdd({
        type: targetType,
        itemId,
        description: text.trim(),
        remindAt: date.toISOString(),
      });
      resetAndClose();
    } catch (error) {
      console.error('Error creating reminder:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CustomModal
      open={open}
      onClose={resetAndClose}
      title="Adaugă reminder"
      className="relative bg-white rounded-xl w-full max-w-2xl h-[85vh] max-h-[720px] sm:min-w-[500px] flex flex-col overflow-hidden"
    >
      <div className="p-6 space-y-5">
        <div>
          <label className="text-sm font-medium text-secondary mb-2 block">Aplică la</label>
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                { value: 'general', label: 'General' },
                { value: 'booking', label: 'Rezervare' },
                { value: 'location', label: 'Locație' },
              ] as const
            ).map((option) => (
              <CustomRadioButton
                key={option.value}
                name="reminder-target-type"
                value={option.value}
                label={option.label}
                checked={targetType === option.value}
                onChange={(value) => setTargetType(value as ReminderType)}
              />
            ))}
          </div>
        </div>

        {targetType === 'booking' && (
          <div>
            <label className="text-sm font-medium text-secondary mb-2 block">Rezervare</label>
            <select
              value={selectedBookingId}
              onChange={(e) => setSelectedBookingId(e.target.value)}
              disabled={isLoadingBookings}
              className="w-full border border-[var(--color-gray)] rounded-lg px-3 py-2 text-sm text-secondary disabled:opacity-60"
            >
              <option value="">
                {isLoadingBookings ? 'Se încarcă rezervările...' : 'Selectează o rezervare'}
              </option>
              {bookingOptions.map((booking) => (
                <option key={booking.id} value={booking.id}>
                  {booking.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {targetType === 'location' && (
          <div>
            <label className="text-sm font-medium text-secondary mb-2 block">Locație</label>
            <select
              value={selectedLocationId}
              onChange={(e) => setSelectedLocationId(e.target.value)}
              disabled={isLoadingLocations}
              className="w-full border border-[var(--color-gray)] rounded-lg px-3 py-2 text-sm text-secondary disabled:opacity-60"
            >
              <option value="">
                {isLoadingLocations ? 'Se încarcă locațiile...' : 'Selectează o locație'}
              </option>
              {locationOptions.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.label}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="text-sm font-medium text-secondary mb-2 block">Reminder</label>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Ex: Sună clientul pentru confirmare"
            className="w-full border border-[var(--color-gray)] rounded-lg px-3 py-2 text-sm text-secondary"
          />
        </div>

        <CustomDatePicker
          label="Dată"
          selected={date}
          onChange={setDate}
          iconLeft={<Calendar className="w-4 h-4 text-gray-400" />}
          placeholder="Selectează data și ora"
          showTimeSelect
        />

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={resetAndClose}
            className="btn btn-outline px-3 py-1.5 rounded-lg text-sm"
          >
            Anulează
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isValid || isSubmitting}
            className="btn-primary px-3 py-1.5 rounded-lg text-sm disabled:opacity-50"
          >
            {isSubmitting ? 'Se adaugă...' : 'Adaugă'}
          </button>
        </div>
      </div>
    </CustomModal>
  );
};

const EditReminderModal = ({
  reminder,
  onClose,
  onSave,
}: {
  reminder: ApiReminder | null;
  onClose: () => void;
  onSave: (id: number, payload: { description: string; remindAt: string }) => Promise<void>;
}) => {
  const [text, setText] = useState('');
  const [date, setDate] = useState<Date | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (reminder) {
      setText(reminder.description);
      setDate(new Date(reminder.remindAt));
    }
  }, [reminder]);

  const isValid = text.trim().length > 0 && date !== null;

  const handleSubmit = async () => {
    if (!isValid || !date || !reminder) return;

    try {
      setIsSubmitting(true);
      await onSave(reminder.id, {
        description: text.trim(),
        remindAt: date.toISOString(),
      });
      onClose();
    } catch (error) {
      console.error('Error updating reminder:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CustomModal
      open={reminder !== null}
      onClose={onClose}
      title="Editează reminder"
      className="relative bg-white rounded-xl w-full max-w-2xl h-[85vh] max-h-[720px] sm:min-w-[500px] flex flex-col overflow-hidden"
    >
      <div className="p-6 space-y-5">
        <div>
          <label className="text-sm font-medium text-secondary mb-2 block">Reminder</label>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Ex: Sună clientul pentru confirmare"
            className="w-full border border-[var(--color-gray)] rounded-lg px-3 py-2 text-sm text-secondary"
          />
        </div>

        <CustomDatePicker
          label="Dată"
          selected={date}
          onChange={setDate}
          iconLeft={<Calendar className="w-4 h-4 text-gray-400" />}
          placeholder="Selectează data și ora"
          showTimeSelect
        />

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-outline px-3 py-1.5 rounded-lg text-sm"
          >
            Anulează
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isValid || isSubmitting}
            className="btn-primary px-3 py-1.5 rounded-lg text-sm disabled:opacity-50"
          >
            {isSubmitting ? 'Se salvează...' : 'Salvează'}
          </button>
        </div>
      </div>
    </CustomModal>
  );
};

const Reminders = ({ limit }: { limit?: number } = {}) => {
  const navigate = useNavigate();
  const [reminders, setReminders] = useState<ApiReminder[]>([]);
  const [isLoadingReminders, setIsLoadingReminders] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<ApiReminder | null>(null);
  const [deleteReminderId, setDeleteReminderId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [bookingOptions, setBookingOptions] = useState<BookingOption[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);
  const [locationOptions, setLocationOptions] = useState<LocationOption[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(true);

  const fetchReminders = async () => {
    try {
      setIsLoadingReminders(true);
      const { status, response } = await getReminders();
      if (status === 200) {
        const data = Array.isArray(response) ? response : response?.data;
        setReminders(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching reminders:', error);
    } finally {
      setIsLoadingReminders(false);
    }
  };

  const fetchBookingOptions = async () => {
    try {
      setIsLoadingBookings(true);
      const { status, response } = await getBookings({});
      if (status === 200 && response?.data) {
        const bookings = Array.isArray(response.data) ? response.data : [];
        setBookingOptions(
          bookings.map((booking: any) => ({
            id: booking.id,
            code: booking.code,
            label: `#${booking.code} — ${booking.customerName}`,
          }))
        );
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setIsLoadingBookings(false);
    }
  };

  const fetchLocationOptions = async () => {
    try {
      setIsLoadingLocations(true);
      const { status, response } = await getLocations();
      if (status === 200 && response?.data) {
        const locations = Array.isArray(response.data) ? response.data : [];
        setLocationOptions(
          locations.map((location: any) => ({
            id: location.id,
            slug: location.slug,
            label: location.name,
          }))
        );
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
    } finally {
      setIsLoadingLocations(false);
    }
  };

  useEffect(() => {
    fetchReminders();
    fetchBookingOptions();
    fetchLocationOptions();
  }, []);

  const addReminder = async (payload: {
    type: ReminderType;
    itemId: number | string | null;
    description: string;
    remindAt: string;
  }) => {
    const { status } = await createReminder(payload);
    if (status !== 200 && status !== 201) {
      throw new Error('Failed to create reminder');
    }
    await fetchReminders();
  };

  const saveReminder = async (id: number, payload: { description: string; remindAt: string }) => {
    const { status } = await updateReminder(id, payload);
    if (status !== 200 && status !== 201) {
      throw new Error('Failed to update reminder');
    }
    await fetchReminders();
  };

  const handleDeleteConfirm = async () => {
    if (deleteReminderId === null) return;

    try {
      setIsDeleting(true);
      const { status } = await deleteReminder(deleteReminderId);
      if (status === 200 || status === 204) {
        await fetchReminders();
      }
    } catch (error) {
      console.error('Error deleting reminder:', error);
    } finally {
      setIsDeleting(false);
      setDeleteReminderId(null);
    }
  };

  const displayedReminders =
    typeof limit === 'number' ? reminders.slice(0, limit) : reminders;
  const hasMore = typeof limit === 'number' && reminders.length > limit;

  return (
    <div className="h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-secondary">Remindere</h2>
        </div>
        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="btn btn-outline flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm flex-shrink-0"
        >
          <Plus className="w-3.5 h-3.5" aria-hidden />
          <span>Adaugă</span>
        </button>
      </div>

      {isLoadingReminders ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-16 rounded-lg border border-[var(--color-gray)] bg-white/80 animate-pulse"
            />
          ))}
        </div>
      ) : reminders.length === 0 ? (
        <div className="text-center py-12">
          <Bell className="w-12 h-12 text-[var(--color-gray)] mx-auto mb-3" />
          <p className="text-muted text-sm">
            Niciun reminder momentan. Adaugă unul pentru a nu uita de sarcinile importante.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayedReminders.map((reminder) => (
            <div
              key={reminder.id}
              onClick={() => setEditingReminder(reminder)}
              className="border border-[var(--color-gray)] rounded-lg px-4 py-3 flex items-center gap-3 cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-secondary truncate">{reminder.description}</p>
                <p className="text-xs text-muted mt-0.5">{formatDateRomanian(reminder.remindAt, true)}</p>
                <TargetBadge target={getReminderTarget(reminder, bookingOptions, locationOptions)} />
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteReminderId(reminder.id);
                }}
                className="text-muted hover:text-[var(--color-red)] transition-colors flex-shrink-0"
                aria-label="Șterge reminder"
              >
                <Trash2 className="w-4 h-4" aria-hidden />
              </button>
            </div>
          ))}

          {hasMore && (
            <button
              type="button"
              onClick={() => navigate('/partner/dashboard/reminders')}
              className="w-full flex items-center justify-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors py-2"
            >
              <span>Vezi mai mult</span>
              <ChevronRight className="w-4 h-4" aria-hidden />
            </button>
          )}
        </div>
      )}

      <AddReminderModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={addReminder}
        bookingOptions={bookingOptions}
        isLoadingBookings={isLoadingBookings}
        locationOptions={locationOptions}
        isLoadingLocations={isLoadingLocations}
      />

      <EditReminderModal
        reminder={editingReminder}
        onClose={() => setEditingReminder(null)}
        onSave={saveReminder}
      />

      <ConfirmModal
        isOpen={deleteReminderId !== null}
        title="Șterge reminder"
        text="Ești sigur că vrei să ștergi acest reminder? Această acțiune nu poate fi anulată."
        cancelText="Anulează"
        confirmText={isDeleting ? 'Se șterge...' : 'Șterge'}
        onClose={() => setDeleteReminderId(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default Reminders;
