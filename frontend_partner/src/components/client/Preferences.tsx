import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Bell, Globe } from "lucide-react";
import CustomSwitcher from "../shared/CustomSwitcher";
import CustomSelect from "../shared/CustomSelect";
import { useUserStore } from "../../store/user.store";
import i18n from "../../i18n";
import { updatePreferences as updatePreferencesAPI } from "../../api/users/users";
import { Message } from "../shared/Messages";
import type { MessageType } from "../shared/Messages";

const Preferences: React.FC = () => {
  const { t, i18n: i18nInstance } = useTranslation();
  const user = useUserStore((state) => state.user);
  const updatePreferences = useUserStore((state) => state.updatePreferences);
  
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<{ value: string; label: string } | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [preferencesMessage, setPreferencesMessage] = useState<{ type: MessageType; message: string } | null>(null);
  const isInitialized = useRef(false);
  const isUserChangingLanguage = useRef(false);

  const languageOptions = [
    { value: "en", label: "English" },
    { value: "ro", label: "Română" },
  ];

  useEffect(() => {

    if (isUserChangingLanguage.current) return;
    if (isUpdating) return;
    
    const preferences = user?.preferences;
    if (preferences) {
      if (preferences.emailNotifications !== undefined && !isInitialized.current) {
        setEmailNotifications(preferences.emailNotifications);
      }
      if (preferences.language) {
        const lang = languageOptions.find((opt) => opt.value === preferences.language);
        if (lang && (!isInitialized.current || lang.value !== selectedLanguage?.value)) {
          setSelectedLanguage(lang);
          if (!isInitialized.current) {
            i18n.changeLanguage(lang.value);
          }
        }
      } else if (!isInitialized.current) {
        const currentLang = i18nInstance.language || "en";
        const lang = languageOptions.find((opt) => opt.value === currentLang.split("-")[0]) || languageOptions[0];
        setSelectedLanguage(lang);
      }
    } else if (!isInitialized.current) {
      const currentLang = i18nInstance.language || "en";
      const lang = languageOptions.find((opt) => opt.value === currentLang.split("-")[0]) || languageOptions[0];
      setSelectedLanguage(lang);
    }
    
    if (!isInitialized.current) {
      isInitialized.current = true;
    }
  }, [user]);

  const handleEmailNotificationsChange = async (checked: boolean) => {
    setEmailNotifications(checked);
    setIsUpdating(true);
    setPreferencesMessage(null);
    
    try {
      const response = await updatePreferencesAPI({
        language: selectedLanguage?.value || user?.preferences?.language || "en",
        emailNotifications: checked,
      });
      
      if (response.status === 204) {
        updatePreferences({ emailNotifications: checked });
        setPreferencesMessage({ type: "success", message: t("dashboard.email_notifications_success") });
      } else {
        setEmailNotifications(!checked);
        setPreferencesMessage({ type: "error", message: t("dashboard.email_notifications_error") });
      }
    } catch (error) {
      // Revert on error
      setEmailNotifications(!checked);
      setPreferencesMessage({ type: "error", message: t("dashboard.email_notifications_error") });
      console.error("Failed to update email notifications:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLanguageChange = async (option: { value: string; label: string } | null) => {
    if (option) {
      const previousLanguage = selectedLanguage;
      isUserChangingLanguage.current = true;
      setSelectedLanguage(option);
      i18n.changeLanguage(option.value);
      setIsUpdating(true);
      setPreferencesMessage(null);
      
      try {
        const response = await updatePreferencesAPI({
          language: option.value,
          emailNotifications: emailNotifications,
        });
        
        if (response.status === 204) {
          updatePreferences({ language: option.value });
          setPreferencesMessage({ type: "success", message: t("dashboard.language_success") });
        } else {
          // Revert on error
          setSelectedLanguage(previousLanguage);
          i18n.changeLanguage(previousLanguage?.value || "en");
          setPreferencesMessage({ type: "error", message: t("dashboard.language_error") });
        }
      } catch (error) {
        // Revert on error
        setSelectedLanguage(previousLanguage);
        i18n.changeLanguage(previousLanguage?.value || "en");
        setPreferencesMessage({ type: "error", message: t("dashboard.language_error") });
        console.error("Failed to update language:", error);
      } finally {
        setIsUpdating(false);
        // Reset the flag after a short delay to allow store update to complete
        setTimeout(() => {
          isUserChangingLanguage.current = false;
        }, 100);
      }
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <section className="border border-gray-200 dark:border-gray-800 rounded-xl p-4 sm:p-6 shadow-sm bg-white dark:bg-gray-900">
     
          <h2 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">{t("dashboard.preferences")}</h2>
   

        <div className="space-y-4 sm:space-y-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            {t("dashboard.preferences_description")}
          </p>

          {preferencesMessage && (
            <Message
              type={preferencesMessage.type}
              message={preferencesMessage.message}
              variant="filled"
              dismissible
              onDismiss={() => setPreferencesMessage(null)}
            />
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="p-4 sm:p-5 border border-gray-200 dark:border-gray-800 rounded-lg hover:border-gray-300 dark:hover:border-gray-700 transition">
              <div className="flex items-center gap-3 mb-4">
                <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                <h3 className="font-medium text-gray-900 dark:text-white">{t("dashboard.email_notifications")}</h3>
              </div>
              <CustomSwitcher
                label=""
                checked={emailNotifications}
                onChange={handleEmailNotificationsChange}
              />
            </div>

            <div className="p-4 sm:p-5 border border-gray-200 dark:border-gray-800 rounded-lg hover:border-gray-300 dark:hover:border-gray-700 transition">
              <div className="flex items-center gap-3 mb-4">
                <Globe className="w-5 h-5 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                <h3 className="font-medium text-gray-900 dark:text-white">{t("dashboard.language")}</h3>
              </div>
              <CustomSelect
                value={selectedLanguage}
                onChange={handleLanguageChange}
                options={languageOptions}
                placeholder={t("dashboard.language")}
                isSearchable={false}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Preferences;

