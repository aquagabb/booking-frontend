import {
  Calendar,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import BookingList from "../Forms/Tables/BookingList";
import PendingBookings from "../PendingBookings";

type TabType = "all" | "manage";

const validTabs: TabType[] = ["all", "manage"];

const BookingsPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { tab } = useParams<{ tab?: string }>();

  const getActiveTab = (): TabType => {
    if (tab && validTabs.includes(tab as TabType)) {
      return tab as TabType;
    }
    return "all";
  };

  const activeTab = getActiveTab();
  return (
    <div className="mx-auto space-y-4 sm:space-y-6">
      <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0 ">
        <div className="flex gap-3 sm:gap-4 lg:gap-5 border-b border-gray-200 dark:border-gray-800 pb-1.5 min-w-max sm:min-w-0">
        {[
            { key: "all", label: t("admin_settings.bookings"), icon: <Calendar size={16} /> },
            { key: "manage", label: t("admin_settings.pending_bookings"), icon: <Calendar size={16} /> },
          ].map((tabItem) => (
            <button
              key={tabItem.key}
              onClick={() => {
                navigate(`/partner/bookings/${tabItem.key}`);
              }}
              className={`relative py-1.5 px-1 sm:px-2 text-xs sm:text-sm font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap flex-shrink-0 ${activeTab === tabItem.key
                ? "text-primary dark:text-primary"
                : "text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary"
                }`}
            >
              {tabItem.icon}
              <span>{tabItem.label}</span>
              {activeTab === tabItem.key && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>
      {activeTab === "all" && (
        <BookingList />
      )}

      {activeTab === "manage" && (
        <PendingBookings />
      )}
    </div>
  );
};

export default BookingsPage;
