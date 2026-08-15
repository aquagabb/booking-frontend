import React from "react";
import { Calendar, MessageSquare, FileText, Edit2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import Overview from "./Bookings/Overview";
import { BookingFormBun } from "./Forms/BookingFormBun";
import MessagesAdminBooking from "./Bookings/MessagesAdminBooking";

type TabType = "overview" | "messages" | "details";

const validTabs: TabType[] = ["overview", "messages", "details"];

const BookingPage: React.FC = () => {
  const navigate = useNavigate();
  const { code, tab } = useParams<{ code?: string; tab?: string }>();

  let bookingId: number | null = null;
  if (code && code !== "new") {
    const firstPart = code.split("-")[0];
    const parsed = Number(firstPart);
    if (!Number.isNaN(parsed)) {
      bookingId = parsed;
    }
  }

  const getActiveTab = (): TabType => {
    if (tab && validTabs.includes(tab as TabType)) {
      return tab as TabType;
    }
    return "overview";
  };

  const activeTab = getActiveTab();

  return (
    <div className="mx-auto space-y-4 sm:space-y-6">
      <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0 ">
        <div className="flex gap-3 sm:gap-4 lg:gap-5 border-b border-gray-200 dark:border-gray-800 pb-1.5 min-w-max sm:min-w-0">
          {[
            { key: "overview", label: "Details", icon: <Calendar size={16} /> },
            { key: "messages", label: "Messages", icon: <MessageSquare size={16} /> },
            { key: "details", label: "Edit booking", icon: <Edit2 size={16} /> },
          ].map((tabItem) => (
            <button
              key={tabItem.key}
              onClick={() => {
                if (code) {
                  navigate(`/partner/bookings/edit/${code}/${tabItem.key}`);
                }
              }}
              className={`relative py-1.5 px-1 sm:px-2 text-xs sm:text-sm font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap flex-shrink-0 ${
                activeTab === tabItem.key
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
      {activeTab === "overview" && (
        <div>
          <Overview bookingId={bookingId !== null ? String(bookingId) : undefined} />
        </div>
      )}
      {activeTab === "messages" && (
        <div>
          <MessagesAdminBooking bookingId={bookingId} slug={code} />
        </div>
      )}
      {activeTab === "details" && code && (
        <div>
          <BookingFormBun slug={code} />
        </div>
      )}
    </div>
  );
};

export default BookingPage;
