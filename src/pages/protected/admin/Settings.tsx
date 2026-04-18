import { useState, useEffect } from "react";
import {
  Building2,
  CreditCard,
  Bell,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import OrganizationBilling from "../../../components/admin/OrganizationBilling";
import OrganizationInfo from "../../../components/admin/OrganizationInfo";
import OrganizationNotifications from "../../../components/admin/OrganizationNotifications";
import { useAdminStore } from "../../../store/admin.store";
import Feedback from "../../../components/client/Feedback";
import Security from "../../../components/client/Security";

type TabType = "organization" | "billing" | "notifications" | "feedback" | "security";

const validTabs: TabType[] = ["organization", "billing", "notifications", "feedback", "security"];

const Settings = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { tab } = useParams<{ tab?: string }>();
  const organization = useAdminStore((state) => state.organization);
  const setOrganization = useAdminStore((state) => state.setOrganization);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const getActiveTab = (): TabType => {
    if (tab && validTabs.includes(tab as TabType)) {
      return tab as TabType;
    }
    return "organization";
  };

  const activeTab = getActiveTab();

  //   useEffect(() => {
  //     if (!organization) {
  //       // In a real app, you might want to fetch organization data here
  //       // or redirect to login if not authenticated
  //       console.warn("No organization data available");
  //     }

  //     if (!tab || !validTabs.includes(tab as TabType)) {
  //       navigate("/settings/organization", { replace: true });
  //     }
  //   }, [organization, navigate, tab]);

  return (
    <div className="mx-auto space-y-4 sm:space-y-6">
      <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0 ">
        <div className="flex gap-3 sm:gap-4 lg:gap-5 border-b border-gray-200 dark:border-gray-800 pb-1.5 min-w-max sm:min-w-0">
          {[
            { key: "organization", label: t("admin_settings.organization"), icon: <Building2 size={16} /> },
            { key: "billing", label: 'Subscription', icon: <CreditCard size={16} /> },
            { key: "notifications", label: t("admin_settings.notifications"), icon: <Bell size={16} /> },
            { key: "security", label: t("settings.security"), icon: <ShieldCheck size={16} /> },
            { key: "feedback", label: t("settings.feedback"), icon: <MessageSquare size={16} /> },
          ].map((tabItem) => (
            <button
              key={tabItem.key}
              onClick={() => {
                navigate(`/partner/settings/${tabItem.key}`);
                setFeedback(null);
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

      {feedback && (
        <div className={`text-sm sm:text-base font-semibold px-4 py-3 sm:py-4 rounded-lg ${feedback.type === "success"
            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
          }`}>
          {feedback.message}
        </div>
      )}
      <div className="max-w-4xl">
        {activeTab === "organization" && (
          <OrganizationInfo
            organization={organization}
            setOrganization={setOrganization}
          />
        )}

        {activeTab === "billing" && (
          <OrganizationBilling />
        )}

        {activeTab === "notifications" && (
          <OrganizationNotifications />
        )}

    {activeTab === "security" && (
        <Security />
      )}

        {activeTab === "feedback" && (
          <Feedback />
        )}
      </div>

    </div>
  );
};

export default Settings;