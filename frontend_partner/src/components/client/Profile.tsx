import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import CustomInput from "../shared/CustomInput";
import { updateProfile } from "../../api/users/users";
import type { User } from "../../store/user.store";
import { Message } from "../shared/Messages";
import type { MessageType } from "../shared/Messages";

type FormValues = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

type ProfileProps = {
  user: User | null;
  setUser: (user: User) => void;
};

const Profile: React.FC<ProfileProps> = ({ user, setUser }) => {
  const { t } = useTranslation();
  const [profileMessage, setProfileMessage] = useState<{ type: MessageType; message: string } | null>(null);

  const parseName = (name: string | undefined): { firstName: string; lastName: string } => {
    if (!name) return { firstName: "", lastName: "" };
    const parts = name.trim().split(" ");
    if (parts.length === 1) {
      return { firstName: parts[0], lastName: "" };
    }
    const lastName = parts.slice(1).join(" ");
    return { firstName: parts[0], lastName };
  };

  const { firstName: initialFirstName, lastName: initialLastName } = parseName(user?.name);

  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting, isDirty },
    reset,
  } = useForm<FormValues>({
    mode: "onChange",
    defaultValues: {
      firstName: initialFirstName,
      lastName: initialLastName,
      email: user?.email || "",
      phone: user?.phone || "",
    },
  });

  const onSubmitProfile = async (data: FormValues) => {
    try {
      const phoneTrimmed = data.phone.trim();
      const { environment } = await updateProfile({
        firstName: data.firstName,
        lastName: data.lastName,
        phone: phoneTrimmed,
      });

      if (environment.status === 200 || environment.status === 204) {
        const fullName = `${data.firstName} ${data.lastName}`.trim();
        if (user) {
          setUser({
            ...user,
            name: fullName,
            phone: phoneTrimmed || undefined,
          });
        }

        reset({ ...data, phone: phoneTrimmed });
        setProfileMessage({ type: "success", message: t("common.update_profile_success") || "Profile updated successfully" });
        return;
      }

      setProfileMessage({ type: "error", message: t("common.update_error") || "Failed to update profile" });
    } catch (err) {
      console.error("Error updating profile:", err);
      setProfileMessage({ type: "error", message: t("common.update_error") || "Failed to update profile" });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmitProfile)} className="space-y-4 sm:space-y-6">
      <section className="border border-gray-200 dark:border-gray-800 rounded-xl p-4 sm:p-6 shadow-sm bg-white dark:bg-gray-900">
        <h2 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
          {t("profile.profile_information")}
        </h2>

        <div className="space-y-4 sm:space-y-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            {t("profile.profile_description")}
          </p>

          {profileMessage && (
            <Message
              type={profileMessage.type}
              message={profileMessage.message}
              variant="filled"
              dismissible
              onDismiss={() => setProfileMessage(null)}
            />
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <Controller
              name="firstName"
              control={control}
              rules={{ required: t("common.required") as string }}
              render={({ field }) => (
                <CustomInput
                  label={t("profile.first_name")}
                  placeholder={t("profile.first_name")}
                  value={field.value}
                  onChange={field.onChange}
                  required
                  error={errors.firstName?.message as string}
                />
              )}
            />

            <Controller
              name="lastName"
              control={control}
              rules={{ required: t("common.required") as string }}
              render={({ field }) => (
                <CustomInput
                  label={t("profile.last_name")}
                  placeholder={t("profile.last_name")}
                  value={field.value}
                  onChange={field.onChange}
                  required
                  error={errors.lastName?.message as string}
                />
              )}
            />
          </div>

          <Controller
            name="phone"
            control={control}
            rules={{
              validate: (value) => {
                const v = (value ?? "").trim();
                if (!v) return true;
                return /^[0-9+\- ]+$/.test(v) || (t("common.invalid_phone") as string);
              },
            }}
            render={({ field }) => (
              <CustomInput
                label={t("profile.phone")}
                type="tel"
                placeholder={t("profile.phone_placeholder")}
                value={field.value}
                onChange={field.onChange}
                error={errors.phone?.message as string}
              />
            )}
          />

          <Controller
            name="email"
            control={control}
            rules={{
              required: t("common.required") as string,
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: t("common.invalid_email") || "Invalid email address",
              },
            }}
            render={({ field }) => (
              <CustomInput
                label={t("profile.email")}
                type="email"
                placeholder={t("profile.email")}
                value={field.value}
                onChange={field.onChange}
                disabled
                error={errors.email?.message as string}
              />
            )}
          />
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-800">
          <div>
            {isDirty && (
              <span className="inline-flex items-center rounded-lg px-3 py-1.5 text-xs sm:text-sm font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400">
                {t("common.modified")}
              </span>
            )}
          </div>
          <button
            type="submit"
            disabled={isSubmitting || !isDirty}
            className="w-full sm:w-auto bg-primary text-white px-5 py-2 rounded-lg hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base font-medium"
          >
            {isSubmitting ? t("common.saving") : t("common.save")}
          </button>
        </div>
      </section>
    </form>
  );
};

export default Profile;

