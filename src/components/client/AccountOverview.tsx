import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { type User } from "../../store/user.store";
import { useTranslation } from "react-i18next";
import { User as UserIcon, Clock, Shield, Hourglass } from "lucide-react";
import ReservationList from "../../pages/protected/client/Reservations/ReservationList";
import Favorites from "../../pages/protected/Favorites";
import type { Reservation } from "../../pages/protected/client/Reservations/types";
import ToolTip from "../shared/ToolTip";
import { getBookings } from "../../api/bookings/bookings";

const AccountOverview = ({ user }: { user: User | null }) => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [pendingBookings, setPendingBookings] = useState<any[]>([]);
    const [reservations, setReservations] = useState<Reservation[]>([]);


    const transformBookingToReservation = (booking: any): Reservation => {
        return {
            id: booking.id,
            code: booking.code,
            locationName: booking.locationName,
            address: booking.locationAddress,
            image: booking.locationPhoto,
            status: booking.status,
            checkIn: booking.checkIn,
            checkOut: booking.checkOut,
            expiresAt: booking.expiresAt,
            guests: booking.guests || 0,
        };
    };

    const stats = useMemo(() => {
        return {
            upcomingReservations: reservations.length,
            pendingReservations: pendingBookings.length,
            reviewsReceived: 14, // Dummy data
        };
    }, [reservations, pendingBookings]);

    useEffect(() => {
        if (!user) {
            navigate("/login");
            return;
        }
    }, [user, navigate]);

    const fetchPendingBookings = async () => {
        try {
            const { status, response } = await getBookings({ type: 'customer', status: 'pending' });
            if (status === 200 && response?.data) {
                const transformed = response.data.map(transformBookingToReservation);
                setPendingBookings(transformed);
            }
        } catch (error) {
            console.error('Error fetching pending bookings:', error);
        }
    };

    const fetchUpcomingBookings = async () => {
        try {
            const { status, response } = await getBookings({ type: 'customer', status: 'confirmed' });
            if (status === 200 && response?.data) {
                const transformed = response.data.map(transformBookingToReservation);
                setReservations(transformed);
            }
        } catch (error) {
            console.error('Error fetching upcoming bookings:', error);
        }
    };

    useEffect(() => {
        if (user) {
            fetchPendingBookings();
            fetchUpcomingBookings();
        }
    }, [user]);

    if (!user) return null;

    const getRoleLabel = (role?: string) => {
        switch (role) {
            case "admin":
                return "Admin";
            case "owner":
                return "Owner";
            default:
                return "Member";
        }
    };

    const handleRoleClick = () => {
        if (user?.role !== "owner") {
            navigate("/partner");
        }
    };

    const handlePendingReservationsClick = () => {
        const pendingTitle = document.getElementById("pending-reservations-title");
        if (pendingTitle) {
            const elementPosition = pendingTitle.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - 100; // 20px offset pentru spațiu
            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            });
        }
    };

    return (
        <div className="mx-auto max-w-7xl">
            {/* Unified Container */}
            <section className="">

                <div className="pb-8 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                        {/* Left: Avatar, Name, Email */}
                        <div className="flex items-center gap-4 w-full sm:w-auto">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0 border-2 ">
                                <UserIcon className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400 " />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
                                    {user.name}
                                </h2>
                                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 truncate mt-1">
                                    {user.email}
                                </p>
                            </div>
                        </div>

                        {/* Right: Role Badge */}
                        {user.role && (
                            <div className="flex-shrink-0">
                                <ToolTip
                                    content={user.role !== "owner" ? t("profile.how_to_become_owner") : undefined}
                                    onClick={handleRoleClick}
                                    disabled={user.role === "owner"}
                                    trigger="both"
                                >
                                    <span
                                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 transition-colors ${user.role !== "owner" ? "cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700" : "cursor-default"
                                            }`}
                                    >
                                        <Shield className="w-3.5 h-3.5" />
                                        {getRoleLabel(user.role)}
                                    </span>
                                </ToolTip>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-6">
                    {/* Upcoming Reservations */}
                    <div className="flex items-center gap-3 p-3 sm:p-4 rounded-lg   border border-gray-200 dark:border-gray-700 hover:shadow-sm transition-shadow">
                        <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                            <Clock className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-0.5">
                                {t("profile.upcoming_reservations")}
                            </p>
                            <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                                {stats.upcomingReservations}
                            </p>
                        </div>
                    </div>



                    {/* Pending Reservations */}
                    <div 
                        onClick={handlePendingReservationsClick}
                        className="flex items-center gap-3 p-3 sm:p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-sm transition-shadow cursor-pointer"
                    >
                        <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                            <Hourglass className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-0.5">
                                {t("profile.pending_reservations")}
                            </p>
                            <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                                {stats.pendingReservations}
                            </p>
                        </div>
                    </div>

                    {/* Reviews Received */}
                    {/* <div className="flex items-center gap-3 p-3 sm:p-4 rounded-lg  border border-gray-200 dark:border-gray-700 hover:shadow-sm transition-shadow">
                        <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
                            <Star className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-0.5">
                                {t("profile.reviews_received")}
                            </p>
                            <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                                {stats.reviewsReceived}
                            </p>
                        </div>
                    </div> */}
                </div>
                {/* Upcoming Reservations Section */}
                <div className="mt-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 border-b pb-4">
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                            {t("profile.upcoming_reservations")}
                        </h3>
                        <Link
                            to="/account/bookings"
                            className="text-sm sm:text-base text-primary hover:text-primary/80 transition font-medium"
                        >
                            {t("common.view_all")}
                        </Link>
                    </div>

                    <div className="space-y-3">
                        <ReservationList items={reservations} />
                    </div>
                </div>
                {pendingBookings.length > 0 && <div className="mt-4">
                    <div id="pending-reservations-title" className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 border-b pb-4">
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                            {t("profile.pending_reservations")}
                        </h3>
                    </div>
                    <ReservationList items={pendingBookings} />
                </div>}



                {/* Favorites Section */}
                <div className="mt-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 border-b pb-4">
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                            {t("profile.favorites")}
                        </h3>
                        <Link
                            to="/account/favorites"
                            className="text-sm sm:text-base text-primary hover:text-primary/80 transition font-medium"
                        >
                            {t("common.view_all")}
                        </Link>
                    </div>
                    <Favorites viewHeader={false} />
                </div>
            </section>
        </div>
    );
};

export default AccountOverview;
