import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Calendar,
  Users,
  MapPin,
  User,
  MessageCircle,
  Star,
  Hash,
} from "lucide-react";

type Reservation = {
  id: string;
  code: string;
  eventName: string;
  venue: string;
  location: string;
  address: string;
  rating: number;
  type: string;
  guests: number;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  checkIn: string;
  checkOut: string;
  status: "confirmed" | "pending" | "cancelled" | "past";
  image: string;
  price: string;
};

const BookingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reservation, setReservation] = useState<Reservation | null>(null);

  useEffect(() => {
    const dummyReservations: Reservation[] = [
      {
        id: "r1",
        code: "DK32DF",
        eventName: "Alice Wedding",
        venue: "Grand Palace",
        location: "Bucharest",
        address: "Grand Palace, Strada Victoriei 12, Bucharest",
        rating: 4.7,
        type: "Wedding",
        guests: 120,
        customer: {
          name: "Alice Smith",
          email: "alice@example.com",
          phone: "0712345678",
        },
        checkIn: "September 3, 2025 12:00 PM",
        checkOut: "September 4, 2025 12:00 PM",
        status: "past",
        image:
          "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=800&q=80",
        price: "€2,500",
      },
      {
        id: "r2",
        code: "AB91XZ",
        eventName: "Corporate Party",
        venue: "Nomad Skybar",
        location: "Bucharest",
        address: "Nomad Skybar, Strada Smârdan 27, Bucharest",
        rating: 4.5,
        type: "Corporate",
        guests: 80,
        customer: {
          name: "John Doe",
          email: "john@example.com",
          phone: "0722334455",
        },
        checkIn: "September 10, 2025 18:00 PM",
        checkOut: "September 10, 2025 23:00 PM",
        status: "confirmed",
        image:
          "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=800&q=80",
        price: "€1,200",
      },
    ];

    const found = dummyReservations.find((res) => res.id === id);
    setReservation(found || null);
  }, [id]);

  if (!reservation) {
    return (
      <div className="p-6 text-center text-gray-500">
        Reservation not found.
      </div>
    );
  }

  const statusBadge = () => {
    switch (reservation.status) {
      case "past":
        return <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-700">Finished</span>;
      case "cancelled":
        return <span className="px-2 py-1 text-xs rounded bg-red-100 text-red-700">Cancelled</span>;
      case "confirmed":
        return <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-700">Confirmed</span>;
      case "pending":
        return <span className="px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-700">Pending</span>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-blue-600 hover:underline"
      >
        <ArrowLeft className="w-4 h-4" /> Back to reservations
      </button>

      {/* Reservation + Venue Section */}
      <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden flex flex-col md:flex-row">
        {/* Imagine Venue în stânga */}
        <div className="md:w-1/3">
          <img
            src={reservation.image}
            alt={reservation.venue}
            className="w-full h-60 md:h-full object-cover"
          />
        </div>

        {/* Detalii Venue în dreapta */}
        <div className="flex-1 p-6 space-y-4">
          {/* Titlu + Status + Price */}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">{reservation.eventName}</h1>
              <p className="text-gray-600">{reservation.venue}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              {statusBadge()}
              <p className="text-lg font-semibold text-gray-800">{reservation.price}</p>
            </div>
          </div>

          {/* Reservation Code */}
          <p className="flex items-center gap-2 text-sm text-gray-600">
            <Hash className="w-4 h-4 text-blue-600" /> Reservation Code:{" "}
            <span className="font-medium text-gray-800">{reservation.code}</span>
          </p>

          {/* Venue Info */}
          <div className="flex flex-wrap items-center gap-3 text-gray-600 text-sm">
            <MapPin width={16} height={16} />
            <span>{reservation.address}</span>
            <span className="text-gray-400">|</span>
            <div className="flex items-center gap-1 text-yellow-500">
              <Star size={16} className="fill-current stroke-none" />
              <span>{reservation.rating}</span>
            </div>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                reservation.location
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline ml-2"
            >
              View on Google Maps
            </a>
          </div>


          {reservation.status !== "past" && reservation.status !== "cancelled" && (
            <button
              onClick={() => navigate(`/reservations/${reservation.id}/chat`)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <MessageCircle className="w-4 h-4" />
              Open Chat
            </button>
          )}
        </div>
      </div>

      {/* Details Section */}
      <div className="bg-white rounded-xl shadow border border-gray-200 p-6 space-y-4">
        <h2 className="text-lg font-semibold mb-2">Reservation Details</h2>
        <div className="grid sm:grid-cols-2 gap-4 text-sm text-gray-700">
          <p className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span>
              <strong>Check-in:</strong> {reservation.checkIn}
            </span>
          </p>
          <p className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span>
              <strong>Check-out:</strong> {reservation.checkOut}
            </span>
          </p>
          <p className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span>
              <strong>Guests:</strong> {reservation.guests}
            </span>
          </p>
          <p>
            <strong>Type:</strong> {reservation.type}
          </p>
        </div>
      </div>

      {/* Customer Section */}
      <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-2">Customer</h2>
        <p className="text-gray-700">
          <strong>Name:</strong> {reservation.customer.name}
        </p>
        <p className="text-gray-700">
          <strong>Email:</strong> {reservation.customer.email}
        </p>
        <p className="text-gray-700">
          <strong>Phone:</strong> {reservation.customer.phone}
        </p>
      </div>
    </div>
  );
};

export default BookingDetails;
