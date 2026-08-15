import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Send } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import CustomTextarea from "../shared/CustomTextarea";

import { createFeedback } from "../../api/users/users";
import { Message } from "../shared/Messages";

type FeedbackFormValues = {
  subject: string;
  message: string;
};

const Feedback: React.FC = () => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<FeedbackFormValues>({
    mode: "onChange",
    defaultValues: {
      subject: "",
      message: "",
    },
  });

  const onSubmit = async (data: FeedbackFormValues) => {
    setIsSubmitting(true);
    setFeedbackMessage(null);

    try {
      const { status } = await createFeedback({
        subject: data.subject,
        message: data.message,
      });
      if (status === 204) {
        setFeedbackMessage({ type: "success", message: t("settings.feedback_success") });
        reset();
      } else {
        setFeedbackMessage({ type: "error", message: t("settings.feedback_error") });
      }
    } catch (error) {
      setFeedbackMessage({ type: "error", message: t("settings.feedback_error") });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
      <div className="space-y-4 sm:space-y-6">
        <section className="border border-gray-200 dark:border-gray-800 rounded-xl p-4 sm:p-6 shadow-sm bg-white dark:bg-gray-900">
        <h2 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
              {t("settings.feedback")}
            </h2>

          <div className="space-y-4 sm:space-y-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              {t("settings.feedback_description")}
            </p>

            {feedbackMessage && (
              <Message
                type={feedbackMessage.type}
                message={feedbackMessage.message}
                variant="filled"
                dismissible
                onDismiss={() => setFeedbackMessage(null)}
              />
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
              <div>
                <Controller
                  name="subject"
                  control={control}
                  rules={{ required: t("common.required") }}
                  render={({ field }) => (
                    <CustomTextarea
                      label={t("settings.feedback_subject")}
                      placeholder={t("settings.feedback_subject_placeholder")}
                      value={field.value}
                      onChange={field.onChange}
                      rows={1}
                      required
                      error={errors.subject?.message as string}
                    />
                  )}
                />
              </div>

              <div>
                <Controller
                  name="message"
                  control={control}
                  rules={{ required: t("common.required") }}
                  render={({ field }) => (
                    <CustomTextarea
                      label={t("settings.feedback_message")}
                      placeholder={t("settings.feedback_message_placeholder")}
                      value={field.value}
                      onChange={field.onChange}
                      rows={6}
                      required
                      error={errors.message?.message as string}
                    />
                  )}
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
            
                  {isSubmitting
                    ? t("common.saving")
                    : t("settings.feedback_submit")}
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>
    );
  };

  export default Feedback;

