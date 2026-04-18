import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Bell, Mail, MessageSquare, AlertCircle } from "lucide-react";
import CustomSwitcher from "../shared/CustomSwitcher";
import { useAdminStore } from "../../store/admin.store";
import { Message } from "../shared/Messages";
import type { MessageType } from "../shared/Messages";
import { getProfile, updatePreferences } from "../../api/organizations/organizations";

type NotificationSettings = {
  emailNotifications: boolean;
  messageNotifications: boolean;
  reminderNotifications: boolean;
  marketingNotifications: boolean;
};

const OrganizationNotifications: React.FC = () => {
  const { t } = useTranslation();
  const updatePreferencesStore = useAdminStore((state) => state.updatePreferences);
  
  const [settings, setSettings] = useState<NotificationSettings>({
    emailNotifications: false,
    messageNotifications: false,
    reminderNotifications: false,
    marketingNotifications: false,
  });

  const [isUpdating, setIsUpdating] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState<{ type: MessageType; message: string } | null>(null);

  const fetchProfileInformations = useCallback(async () => {
    const { response, status } = await getProfile();
    if (status === 200 && response) {
      setSettings({
        emailNotifications: response.emailNotifications ?? false,
        messageNotifications: response.messageNotifications ?? false,
        reminderNotifications: response.reminderNotifications ?? false,
        marketingNotifications: response.marketingNotifications ?? false,
      });
    }
  }, []);

  useEffect(() => {
    fetchProfileInformations();
  }, [fetchProfileInformations]);

  const handleSettingChange = async (key: keyof NotificationSettings, checked: boolean) => {
    const newSettings = { ...settings, [key]: checked };
    setSettings(newSettings);
    setIsUpdating(true);
    setNotificationMessage(null);
    
    try {
      const payload = {
        emailNotifications: newSettings.emailNotifications,
        messageNotifications: newSettings.messageNotifications,
        reminderNotifications: newSettings.reminderNotifications,
        marketingNotifications: newSettings.marketingNotifications,
      };

      const { status } = await updatePreferences(payload);

      if (status === 200 || status === 204) {
        updatePreferencesStore({ emailNotifications: newSettings.emailNotifications });
        setNotificationMessage({ type: "success", message: t("admin_settings.notifications_update_success") });
      } else {
        setSettings(settings); // Revert on error
        setNotificationMessage({ type: "error", message: t("admin_settings.notifications_update_error") });
      }
    } catch (error) {
      setSettings(settings); // Revert on error
      setNotificationMessage({ type: "error", message: t("admin_settings.notifications_update_error") });
      console.error("Failed to update notification settings:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <section className="border border-gray-200 dark:border-gray-800 rounded-xl p-4 sm:p-6 shadow-sm bg-white dark:bg-gray-900">
        <h2 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
          {t("admin_settings.notification_preferences")}
        </h2>

        <div className="space-y-4 sm:space-y-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            {t("admin_settings.notification_description")}
          </p>

          {notificationMessage && (
            <Message
              type={notificationMessage.type}
              message={notificationMessage.message}
              variant="filled"
              dismissible
              onDismiss={() => setNotificationMessage(null)}
            />
          )}

          {/* Email Notifications */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="p-4 sm:p-5 border border-gray-200 dark:border-gray-800 rounded-lg hover:border-gray-300 dark:hover:border-gray-700 transition">
              <div className="flex items-center gap-3 mb-4">
                <Mail className="w-5 h-5 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">{t("admin_settings.email_notifications")}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t("admin_settings.email_notifications_desc")}</p>
                </div>
              </div>
              <CustomSwitcher
                label=""
                checked={settings.emailNotifications}
                onChange={(checked) => handleSettingChange("emailNotifications", checked)}
                disabled={isUpdating}
              />
            </div>

            <div className="p-4 sm:p-5 border border-gray-200 dark:border-gray-800 rounded-lg hover:border-gray-300 dark:hover:border-gray-700 transition">
              <div className="flex items-center gap-3 mb-4">
                <MessageSquare className="w-5 h-5 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">{t("admin_settings.message_notifications")}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t("admin_settings.message_notifications_desc")}</p>
                </div>
              </div>
              <CustomSwitcher
                label=""
                checked={settings.messageNotifications}
                onChange={(checked) => handleSettingChange("messageNotifications", checked)}
                disabled={isUpdating}
              />
            </div>

            <div className="p-4 sm:p-5 border border-gray-200 dark:border-gray-800 rounded-lg hover:border-gray-300 dark:hover:border-gray-700 transition">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="w-5 h-5 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">{t("admin_settings.reminder_notifications")}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t("admin_settings.reminder_notifications_desc")}</p>
                </div>
              </div>
              <CustomSwitcher
                label=""
                checked={settings.reminderNotifications}
                onChange={(checked) => handleSettingChange("reminderNotifications", checked)}
                disabled={isUpdating}
              />
            </div>

            <div className="p-4 sm:p-5 border border-gray-200 dark:border-gray-800 rounded-lg hover:border-gray-300 dark:hover:border-gray-700 transition">
              <div className="flex items-center gap-3 mb-4">
                <Mail className="w-5 h-5 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">{t("admin_settings.marketing_emails")}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t("admin_settings.marketing_emails_desc")}</p>
                </div>
              </div>
              <CustomSwitcher
                label=""
                checked={settings.marketingNotifications}
                onChange={(checked) => handleSettingChange("marketingNotifications", checked)}
                disabled={isUpdating}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default OrganizationNotifications;


