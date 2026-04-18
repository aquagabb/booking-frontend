import { useEffect, useState } from "react";
import { useNavigate, NavLink, Link } from "react-router-dom";
import { useUserStore } from "../../store/user.store";
import { useTranslation } from "react-i18next";
import {
    MoreVertical,
    User as UserIcon,
    Heart
} from "lucide-react";
import ReservationList from "./client/Reservations/ReservationList";
import Favorites from "./Favorites";

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

    const reservations = [
        {
            id: "r1",
            venue: "Grand Palace",
            address: "Str. Unirii 12, București",
            image:
                "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=800&q=80",
            status: "past",
            checkIn: "2025-09-03T14:00",
            checkOut: "2025-09-04T12:00",
            guests: 150,
        },
        {
            id: "r3",
            venue: "Sky Lounge",
            address: "Calea Dorobanți 99, București",
            image:
                "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80",
            status: "confirmed",
            checkIn: "2025-09-20T20:00",
            checkOut: "2025-09-21T02:00",
            guests: 80,
        },
    ];

    useEffect(() => {
        if (!user) {
            navigate("/login");
            return;
        }
    }, [user, navigate]);

    if (!user) return null;



    return (
        <div className="mx-auto space-y-12">
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

                <div className="flex items-center gap-3">
         
                    <NavLink
                        to="/settings"
                        className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition"
                    >

                        {t("profile.account_settings")}
                    </NavLink>

                    {user.role === "owner" ? (
                        <NavLink
                            to="/partner/dashboard"
                            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition"
                        >
                            {t("profile.partner_dashboard")}
                        </NavLink>
                    ) : (
                        <NavLink
                            to="/join"
                            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition"
                        >
                            {t("profile.register_restaurant")}
                        </NavLink>
                    )}
                </div>
            </section>

            <section>
                <div className="flex justify-between items-center border-b mb-4">
                    <h3 className="text-xl font-semibold mb-4">
                        {t("profile.upcoming_reservations")}

                    </h3>
                    <Link
                        to="/booking-history"
                        className="text-primary"
                    >
                        {t("common.view_all")}
                    </Link>
                </div>

                <div className="space-y-3">
                    <ReservationList items={reservations} />
                </div>
            </section>


            <section>
                <div className="flex justify-between items-center border-b mb-4">
                    <h3 className="text-xl font-semibold mb-4">{t("profile.favorites")}</h3>
                    <Link
                        to="/settings/favorites"
                        className="text-primary"
                    >
                        {t("common.view_all")}
                    </Link>
                </div>
                <Favorites viewHeader={false} />
            </section>
        </div>
    );
};

export default Profile;
