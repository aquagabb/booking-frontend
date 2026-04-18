import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useUserStore } from "../../store/user.store";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  User,
  ShieldCheck,
  CreditCard,
  Calendar,
  Settings,
  ChevronRight,
} from "lucide-react";
import AccountOverview from "../../components/client/AccountOverview";
import Profile from "../../components/client/Profile";
import Security from "../../components/client/Security";
import Billing from "../../components/client/Billing";
import Reservations from "../../components/client/Reservations";
import Preferences from "../../components/client/Preferences";

type TabType = "overview" | "profile" | "security" | "billing" | "reservations" | "preferences";

const validTabs: TabType[] = ["overview", "profile", "security", "billing", "reservations", "preferences"];

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { tab } = useParams<{ tab?: string }>();
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const { t } = useTranslation();
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
      navigate("/partner/dashboard/overview", { replace: true });
    }
  }, [user, navigate, tab]);

  const handleFeedback = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
  };

  const menuItems = [
    {
      key: "overview",
      label: t("dashboard.overview"),
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      key: "profile",
      label: t("dashboard.profile"),
      icon: <User className="w-5 h-5" />,
    },
    {
      key: "security",
      label: t("dashboard.security"),
      icon: <ShieldCheck className="w-5 h-5" />,
    },
    {
      key: "billing",
      label: t("dashboard.billing"),
      icon: <CreditCard className="w-5 h-5" />,
    },
    {
      key: "reservations",
      label: t("dashboard.reservations"),
      icon: <Calendar className="w-5 h-5" />,
    },
    {
      key: "preferences",
      label: t("dashboard.preferences"),
      icon: <Settings className="w-5 h-5" />,
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <AccountOverview
            user={user}
            upcomingBookings={2}
            lastTransaction={{
              date: "2025-09-01",
              amount: "$79.00",
            }}
            subscriptionStatus={{
              plan: "Professional",
              status: "active",
            }}
          />
        );
      case "profile":
        return (
          <Profile
            user={user}
            setUser={setUser}
            onFeedback={handleFeedback}
          />
        );
      case "security":
        return <Security />;
      case "billing":
        return <Billing />;
      case "reservations":
        return <Reservations />;
      case "preferences":
        return <Preferences />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mobile menu button */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex items-center gap-2 px-4 py-2 border rounded-lg bg-white dark:bg-gray-900"
          >
            <Settings className="w-5 h-5" />
            <span className="font-medium">{t("dashboard.menu")}</span>
            <ChevronRight
              className={`w-4 h-4 transition-transform ${
                isMobileMenuOpen ? "rotate-90" : ""
              }`}
            />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside
            className={`lg:w-64 flex-shrink-0 ${
              isMobileMenuOpen ? "block" : "hidden lg:block"
            }`}
          >
            <div className="bg-white dark:bg-gray-900 border rounded-xl shadow-sm p-4 sticky top-8">
              <h2 className="text-lg font-semibold mb-4 px-2">
                {t("dashboard.account_settings")}
              </h2>
              <nav className="space-y-1">
                {menuItems.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => {
                      navigate(`/partner/dashboard/${item.key}`);
                      setIsMobileMenuOpen(false);
                      setFeedback(null);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === item.key
                        ? "bg-primary/10 text-primary dark:bg-primary/20"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                    {activeTab === item.key && (
                      <ChevronRight className="w-4 h-4 ml-auto" />
                    )}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {feedback && (
              <div
                className={`mb-6 text-base font-semibold px-4 py-4 rounded-lg ${
                  feedback.type === "success"
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                }`}
              >
                {feedback.message}
              </div>
            )}

            <div className="p-6 lg:p-8">
              {renderContent()}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

