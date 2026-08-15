import { useEffect, useState } from "react";
import { useNavigate, NavLink, Link } from "react-router-dom";
import { useUserStore } from "../../store/user.store";
import { useTranslation } from "react-i18next";
import {
    MoreVertical,
    User as UserIcon,
    Heart
} from "lucide-react";

type FavoriteVenue = {
    id: string;
    name: string;
    location: string;
    image: string;
};

type ReservationStatus = "confirmed" | "pending" | "cancelled" | "past";

type Reservation = {
    id: string;
    venue: string;
    date: string;
    image: string;
    status: ReservationStatus;
    unreadMessages: number;
};

const Profile = () => {
    const user = useUserStore((state) => state.user);
    const navigate = useNavigate();
    const { t } = useTranslation();

    const [favorites, setFavorites] = useState<FavoriteVenue[]>([
        {
            id: "1",
            name: "Hard Rock Café",
            location: "București",
            image:
                "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80",
        },
        {
            id: "2",
            name: "Berăria H",
            location: "București",
            image:
                "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80",
        },
        {
            id: "3",
            name: "Sardin",
            location: "Constanța",
            image:
                "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80",
        },
        {
            id: "4",
            name: "Nomad Skybar",
            location: "București",
            image:
                "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=800&q=80",
        },
        {
            id: "5",
            name: "Linea / Closer to the Moon",
            location: "București",
            image:
                "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800&q=80",
        },
    ]);

    const [reservations] = useState<Reservation[]>([
        {
            id: "r1",
            venue: "Restaurant La Mama",
            date: "20 Septembrie, 19:00",
            image:
                "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=800&q=80",
            status: "confirmed",
            unreadMessages: 2,
        },
        {
            id: "r2",
            venue: "PizzaHut",
            date: "25 Septembrie, 18:30",
            image:
                "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=800&q=80",
            status: "pending",
            unreadMessages: 0,
        },
        {
            id: "r3",
            venue: "Nomad Skybar",
            date: "10 Septembrie, 21:00",
            image:
                "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=800&q=80",
            status: "cancelled",
            unreadMessages: 0,
        },
        {
            id: "r4",
            venue: "Berăria H",
            date: "1 Septembrie, 20:00",
            image:
                "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80",
            status: "past",
            unreadMessages: 0,
        },
    ]);

    const [openMenu, setOpenMenu] = useState<string | null>(null);

    useEffect(() => {
        if (!user) {
            navigate("/login");
            return;
        }
    }, [user, navigate]);

    if (!user) return null;

    const handleRemoveFavorite = (id: string) => {
        setFavorites((prev) => prev.filter((f) => f.id !== id));
    };

    const handleEditReservation = (id: string) => {
        navigate(`/reservations/${id}/edit`);
    };

    const handleCancelReservation = (id: string) => {
        console.log("Cancel reservation", id);
    };

    const handleOpenChat = (id: string) => {
        navigate(`/reservations/${id}/chat`);
    };

    return (
        <div className="p-6 mx-auto max-w-5xl space-y-12">
            {/* Intro */}
            <section className="flex items-center justify-between bg-white border rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
                        <UserIcon className="w-7 h-7 text-gray-500" />
                    </div>
                    <div>
                        <p className="text-lg font-semibold">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                </div>

                <div className="flex gap-3">

                    {user.role === "owner" ? (
                        <NavLink
                            to="/partner/dashboard"
                            className="flex items-center gap-2 bg-gray-800 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition"
                        >
                            {t("profile.partner_dashboard")}
                        </NavLink>
                    )
                        :
                        <NavLink
                            to="/join"
                            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition"
                        >
                            {t("profile.register_restaurant")}
                        </NavLink>

                    }
                </div>
            </section>

            {/* Upcoming reservations */}
            <section>
                <h3 className="text-xl font-semibold mb-4">
                    {t("profile.upcoming_reservations")}
                    
                </h3>
                <div className="space-y-3">
                    {reservations
                        .filter((res) => res.status === "confirmed" || res.status === "pending")
                        .map((res) => (
                            <div
                                key={res.id}
                                className="relative flex items-center gap-4 p-4 rounded-lg border bg-gray-50 hover:bg-gray-100 transition"
                            >
                                <img
                                    src={res.image}
                                    alt={res.venue}
                                    className="w-24 h-24 object-cover rounded-md"
                                />
                                <div className="flex-1">
                                    <p className="font-medium">{res.venue}</p>
                                    <p className="text-sm text-gray-500">{res.date}</p>
                                    {res.status === "pending" && (
                                        <span className="inline-block mt-1 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                                            {t("profile.pending")}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <button
                                            onClick={() =>
                                                setOpenMenu(openMenu === res.id ? null : res.id)
                                            }
                                            className="p-1 rounded-full hover:bg-gray-200"
                                        >
                                            <MoreVertical className="w-5 h-5 text-gray-600" />
                                        </button>
                                        {openMenu === res.id && (
                                            <div className="absolute right-0 mt-2 w-44 bg-white border rounded-md shadow-lg z-10">
                                                <button
                                                    onClick={() => handleEditReservation(res.id)}
                                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                >
                                                    {t("profile.edit_reservation")}
                                                </button>
                                                <button
                                                    onClick={() => handleCancelReservation(res.id)}
                                                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                                >
                                                    {t("profile.cancel_reservation")}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                </div>
            </section>

            {/* Favorites */}
            <section>
                <h3 className="text-xl font-semibold mb-4">{t("profile.favorites")}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favorites.map((venue) => (
                        <div
                            key={venue.id}
                            className="relative rounded-lg border bg-white shadow-sm hover:shadow-md transition group overflow-hidden"
                        >
                            <img
                                src={venue.image}
                                alt={venue.name}
                                className="w-full h-40 object-cover"
                            />
                            <div className="flex justify-between items-start p-4">
                                <div>
                                    <Link
                                        to={`/venues/${venue.id}`}
                                        className="font-medium text-blue-600 hover:underline"
                                    >
                                        {venue.name}
                                    </Link>
                                    <p className="text-sm text-gray-500">{venue.location}</p>
                                </div>
                                <button
                                    onClick={() => handleRemoveFavorite(venue.id)}
                                    className="opacity-0 group-hover:opacity-100 transition p-1 rounded-full hover:bg-red-50"
                                >
                                    <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default Profile;
