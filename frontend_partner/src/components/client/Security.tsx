import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import CustomInput from "../shared/CustomInput";
import ConfirmModal from "../shared/Modals/ConfirmModal";
import { Message } from "../shared/Messages";
import { useUserStore } from "../../store/user.store";
import { updatePassword, deleteAccount } from "../../api/users/users";

type FormValues = {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
};

type SecurityProps = {};

const Security: React.FC<SecurityProps> = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const clearUser = useUserStore((state) => state.clearUser);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [feedbackMessage, setFeedbackMessage] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    mode: "onChange",
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onValidationError = (errors: Record<string, any>) => {
    if (Object.keys(errors).length > 0) {
      setFeedbackMessage({ type: "error", message: t("common.required_all") });
    }

  };

  const onSubmitPassword = async (data: FormValues) => {
    setFeedbackMessage(null);


    if (!data.currentPassword || !data.newPassword || !data.confirmPassword) {
      setFeedbackMessage({ type: "error", message: t("common.required_all") });
      return;
    }

    if (data.newPassword !== data.confirmPassword) {
      setFeedbackMessage({ type: "error", message: t("common.passwords_not_match") });
      return;
    }

    const passwordPattern = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d!@#$%^&*]{8,}$/;
    if (!passwordPattern.test(data.newPassword)) {
      setFeedbackMessage({ type: "error", message: t("common.password_pattern") });
      return;
    }

    try {
      const { environment } = await updatePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      if (environment.status === 200 || environment.status === 204) {
        setFeedbackMessage({
          type: "success",
          message: t("security.password_update_success"),
        });
        reset({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });

        setTimeout(() => {
          clearUser();
          navigate("/login");
        }, 2500);
        return;
      }

      setFeedbackMessage({
        type: "error",
        message: t("security.password_update_error"),
      });
    } catch (err) {
      console.error("Error changing password:", err);
      setFeedbackMessage({
        type: "error",
        message: t("security.password_update_error"),
      });
    }
  };

  const onDeleteAccount = async () => {
    try {
      const { environment } = await deleteAccount();

      if (environment.status === 200 || environment.status === 204) {
        setFeedbackMessage({
          type: "success",
          message: t("security.delete_account_success")
        });

        setTimeout(() => {
          clearUser();
          navigate("/login");
        }, 2500);

        return;
      }

      setFeedbackMessage({ type: "error", message: t("security.delete_account_error") });
    } catch (err) {
      console.error("Error deleting account:", err);
      setFeedbackMessage({ type: "error", message: t("security.delete_account_error") });
    }
  };

  return (
    <>
      {feedbackMessage && (
        <Message
          type={feedbackMessage.type}
          message={feedbackMessage.message}
          dismissible
          onDismiss={() => setFeedbackMessage(null)}
          className="mb-4"
        />
      )}

      <form onSubmit={handleSubmit(onSubmitPassword, onValidationError)} className="space-y-4 sm:space-y-6">
        <section className="border border-gray-200 dark:border-gray-800 rounded-xl p-4 sm:p-6 shadow-sm bg-white dark:bg-gray-900">
          <h2 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
            {t("security.change_password")}
          </h2>

          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            {t("security.password_change_info")}
          </p>

          <div className="space-y-4 sm:space-y-6">
            <Controller
              name="currentPassword"
              control={control}
              rules={{ required: t("common.required") as string }}
              render={({ field }) => (
                <CustomInput
                  label={t("security.current_password")}
                  type="password"
                  placeholder={t("security.current_password")}
                  value={field.value || ""}
                  onChange={field.onChange}
                  required
                  error={errors.currentPassword?.message as string}
                />
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <Controller
                name="newPassword"
                control={control}
                rules={{ required: t("common.required") as string }}
                render={({ field }) => (
                  <CustomInput
                    label={t("security.new_password")}
                    type="password"
                    placeholder={t("security.new_password")}
                    value={field.value || ""}
                    onChange={field.onChange}
                    required
                    error={errors.newPassword?.message as string}
                  />
                )}
              />

              <Controller
                name="confirmPassword"
                control={control}
                rules={{
                  required: t("common.required") as string
                }}
                render={({ field }) => (
                  <CustomInput
                    label={t("security.confirm_password")}
                    type="password"
                    placeholder={t("security.confirm_password")}
                    value={field.value || ""}
                    onChange={field.onChange}
                    required
                    error={errors.confirmPassword?.message as string}
                  />
                )}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-end gap-4 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-800">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto bg-primary text-white px-5 py-2 rounded-lg hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base font-medium"
            >
              {isSubmitting ? t("common.saving") : t("security.update_password")}
            </button>
          </div>
        </section>

        <section className="border border-gray-200 dark:border-gray-800 rounded-xl p-4 sm:p-6 shadow-sm bg-white dark:bg-gray-900">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 flex items-center gap-2 text-gray-900 dark:text-white">
            {t("security.account_management")}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            {t("security.delete_account_description")}
          </p>
          <button
            type="button"
            onClick={() => setIsDeleteModalOpen(true)}
            className="w-full sm:w-auto border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 px-4 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition text-sm sm:text-base font-medium"
          >
            {t("security.delete_account")}
          </button>
        </section>

        <ConfirmModal
          isOpen={isDeleteModalOpen}
          title={t("security.delete_account_confirm_title")}
          text={t("security.delete_account_confirm_text")}
          cancelText={t("common.cancel")}
          confirmText={t("security.delete_account")}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={() => {
            setIsDeleteModalOpen(false);
            onDeleteAccount();
          }}
        />
      </form>
    </>
  );
};

export default Security;

