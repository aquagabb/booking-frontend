import { useState, useEffect } from "react";
import {
  UserCog,
  ShieldCheck,
  Settings,
  MessageSquare,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useUserStore } from "../../store/user.store";
import Profile from "../../components/client/Profile";
import Security from "../../components/client/Security";

import Preferences from "../../components/client/Preferences";
import Feedback from "../../components/client/Feedback";

type TabType = "profile" | "security" | "preferences" | "feedback";

const validTabs: TabType[] = ["profile", "security", "preferences", "feedback"];

const SettingsPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { tab } = useParams<{ tab?: string }>();
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);


  const getActiveTab = (): TabType => {
    if (tab && validTabs.includes(tab as TabType)) {
      return tab as TabType;
    }
    return "profile";
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
            { key: "profile", label: t("settings.profile"), icon: <UserCog size={16} /> },
            { key: "security", label: t("settings.security"), icon: <ShieldCheck size={16} /> },
            { key: "preferences", label: t("settings.preferences"), icon: <Settings size={16} /> },
            { key: "feedback", label: t("settings.feedback"), icon: <MessageSquare size={16} /> },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => {    
                navigate(`/settings/${tab.key}`);
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


     
      {activeTab === "profile" && (
        <Profile
          user={user}
          setUser={setUser}
        />
      )}
    
      {activeTab === "preferences" && (
        <Preferences />
      )}
      {activeTab === "security" && (
        <Security />
      )}
      {activeTab === "feedback" && (
        <Feedback />
      )}
    </div>
  );
};

export default SettingsPage;
