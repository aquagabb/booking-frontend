import React, { useState, useEffect } from "react";

interface BookingFormProps {
  initialValues?: any;
  locations: string[];
  onSave: (data: any) => void;
  onCancel: () => void;
}

const BookingForm: React.FC<BookingFormProps> = ({
  initialValues,
  locations,
  onSave,
  onCancel,
}) => {
  const [eventName, setEventName] = useState("");
  const [location, setLocation] = useState("");
  const [eventType, setEventType] = useState("");
  const [guests, setGuests] = useState<number | "">("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [status, setStatus] = useState("Pending");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");

  // populam datele c�nd editam
  useEffect(() => {
    if (initialValues) {
      setEventName(initialValues.eventName || "");
      setLocation(initialValues.location || "");
      setEventType(initialValues.type || "");
      setGuests(initialValues.guests || "");
      setCustomerName(initialValues.customerName || "");
      setCustomerEmail(initialValues.customerEmail || "");
      setCustomerPhone(initialValues.customerPhone || "");
      setStatus(initialValues.status || "Pending");
      setCheckIn(initialValues.checkIn || "");
      setCheckOut(initialValues.checkOut || "");
    }
  }, [initialValues]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      eventName,
      location,
      type: eventType,
      guests,
      customerName,
      customerEmail,
      customerPhone,
      status,
      checkIn,
      checkOut,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="text"
        placeholder="Event Name"
        value={eventName}
        onChange={(e) => setEventName(e.target.value)}
        className="w-full rounded border px-3 py-2 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
      />
      <select
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        className="w-full rounded border px-3 py-2 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
      >
        <option value="">Select Location</option>
        {locations.map((loc) => (
          <option key={loc} value={loc}>
            {loc}
          </option>
        ))}
      </select>
      <select
        value={eventType}
        onChange={(e) => setEventType(e.target.value)}
        className="w-full rounded border px-3 py-2 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
      >
        <option value="">Select Event Type</option>
        <option>Wedding</option>
        <option>Party</option>
        <option>Corporate</option>
        <option>Other</option>
      </select>
      <input
        type="number"
        placeholder="Guests"
        value={guests}
        onChange={(e) => setGuests(Number(e.target.value))}
        className="w-full rounded border px-3 py-2 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
      />
      <input
        type="text"
        placeholder="Customer Name"
        value={customerName}
        onChange={(e) => setCustomerName(e.target.value)}
        className="w-full rounded border px-3 py-2 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
      />
      <input
        type="email"
        placeholder="Customer Email"
        value={customerEmail}
        onChange={(e) => setCustomerEmail(e.target.value)}
        className="w-full rounded border px-3 py-2 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
      />
      <input
        type="tel"
        placeholder="Customer Phone"
        value={customerPhone}
        onChange={(e) => setCustomerPhone(e.target.value)}
        className="w-full rounded border px-3 py-2 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
      />
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm text-gray-600 dark:text-gray-300">Check-in</label>
          <input
            type="datetime-local"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className="w-full rounded border px-3 py-2 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="text-sm text-gray-600 dark:text-gray-300">Check-out</label>
          <input
            type="datetime-local"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="w-full rounded border px-3 py-2 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
          />

        </div>
      </div>
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="w-full rounded border px-3 py-2 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
      >
        <option value="Pending">Pending</option>
        <option value="Active">Active</option>
        <option value="Cancelled">Cancelled</option>
        <option value="Finished">Finished</option>
      </select>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded bg-gray-200 px-4 py-2 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Save
        </button>
      </div>
    </form>
  );
};

export default BookingForm;
