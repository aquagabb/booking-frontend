import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Calendar,
  Heart,
  MessageSquareText
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useUserStore } from "../../store/user.store";

import Reservations from "../../components/client/Reservations";

import AccountOverview from "../../components/client/AccountOverview";
import Favorites from "./Favorites";
import MessagesClient from "./MessagesClient";


type TabType = "overview" | "favorites" | "bookings" | "messages";

const validTabs: TabType[] = ["overview", "favorites", "bookings", "messages"];

const AccountTabsPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { tab } = useParams<{ tab?: string }>();

  // query params from url
  const { conversationId } = useParams<{ conversationId?: string }>();

  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);


  console.log('tabtabtabtabtabtab', conversationId);
  const getActiveTab = (): TabType => {
    if (tab && validTabs.includes(tab as TabType)) {
      return tab as TabType;
    }
    return "overview";
  };

  const activeTab = getActiveTab();

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    
    if (!tab || !validTabs.includes(tab as TabType)) {
      navigate("/account/overview", { replace: true });
    }
  }, [user, navigate, tab]);

  return (
    <div className="mx-auto space-y-4 sm:space-y-6">
      <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
        <div className="flex gap-3 sm:gap-4 lg:gap-5 border-b border-gray-200 dark:border-gray-800 pb-1.5 min-w-max sm:min-w-0">
          {[
            { key: "overview", label: t("settings.overview"), icon: <LayoutDashboard size={16} /> },
            { key: "bookings", label: t("settings.bookings"), icon: <Calendar size={16} /> },
            { key: "favorites", label: t("settings.favorites"), icon: <Heart size={16} /> },
            { key: "messages", label: t("settings.messages") || "Messages", icon: <MessageSquareText size={16} /> },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                navigate(`/account/${tab.key}`);
                setFeedback(null);
              }}
              className={`relative py-1.5 px-1 sm:px-2 text-xs sm:text-sm font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap flex-shrink-0 ${
                activeTab === tab.key
                  ? "text-primary dark:text-primary"
                  : "text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {activeTab === tab.key && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {feedback && (
        <div className={`text-sm sm:text-base font-semibold px-4 py-3 sm:py-4 rounded-lg ${
          feedback.type === "success"
            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
        }`}>
          {feedback.message}
        </div>
      )}


      {activeTab === "overview" && (
        <AccountOverview user={user} />
      )}

      {activeTab === "bookings" && (
        <Reservations />
      )}
      {activeTab === "favorites" && (
        <Favorites viewHeader={false} />
      )}
      {activeTab === "messages" && (
        <MessagesClient viewHeader={false} />
      )}
  
    </div>
  );
};

export default AccountTabsPage;
