import React, { useState, useCallback, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import CustomInput from "../shared/CustomInput";
import CustomTextarea from "../shared/CustomTextarea";
import type { Organization } from "../../store/admin.store";
import { Message } from "../shared/Messages";
import type { MessageType } from "../shared/Messages";
import { Building2 } from "lucide-react";
import { getProfile, updateProfile } from "../../api/organizations/organizations";

type FormValues = {
  companyName: string;
  email: string;
  phone?: string;
  address?: string;
  taxId?: string;
  registrationNumber?: string;
};

type OrganizationInfoProps = {
  organization: Organization | null;
  setOrganization: (organization: Organization) => void;
};

const OrganizationInfo: React.FC<OrganizationInfoProps> = ({ organization, setOrganization }) => {
  const { t } = useTranslation();
  const [organizationMessage, setOrganizationMessage] = useState<{ type: MessageType; message: string } | null>(null);

  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting, isDirty },
    reset,
  } = useForm<FormValues>({
    mode: "onChange",
    defaultValues: {
      companyName: organization?.companyName || "",
      email: organization?.email || "",
      phone: organization?.phone || "",
      address: organization?.address || "",
      taxId: organization?.taxId || "",
      registrationNumber: organization?.registrationNumber || "",
    },
  });

  const fetchProfileInformations = useCallback(async () => {
    const { response, status } = await getProfile();
    if (status === 200 && response) {
      const mappedOrganization: Organization = {
        id: response.id?.toString() || "",
        companyName: response.name || "",
        email: response.email || "",
        phone: response.phone || "",
        address: response.address || "",
        taxId: response.taxIdentificationNumber || "",
        registrationNumber: response.registrationNumber || "",
        createdAt: response.createdAt,
        updatedAt: response.updatedAt,
      };
      setOrganization(mappedOrganization);
    }
  }, [setOrganization]);

  useEffect(() => {
    fetchProfileInformations();
  }, [fetchProfileInformations]);

  useEffect(() => {
    if (organization) {
      reset({
        companyName: organization.companyName || "",
        email: organization.email || "",
        phone: organization.phone || "",
        address: organization.address || "",
        taxId: organization.taxId || "",
        registrationNumber: organization.registrationNumber || "",
      });
    }
  }, [organization, reset]);

  const onSubmitOrganization = async (data: FormValues) => {
    try {
      const { email, ...updateData } = data;
      
      const payload = {
        name: updateData.companyName,
        phone: updateData.phone || "",
        address: updateData.address || "",
        taxIdentificationNumber: updateData.taxId || "",
        registrationNumber: updateData.registrationNumber || "",
      };

      const { status } = await updateProfile(payload);

      if (status === 200 || status === 204) {
        if (organization) {
          setOrganization({
            ...organization,
            companyName: updateData.companyName,
            phone: updateData.phone,
            address: updateData.address,
            taxId: updateData.taxId,
            registrationNumber: updateData.registrationNumber,
          });
        }
        reset(data);
        setOrganizationMessage({ type: "success", message: t("admin_settings.organization_update_success") });
        return;
      }

      setOrganizationMessage({ type: "error", message: t("admin_settings.organization_update_error") });
    } catch (err) {
      console.error("Error updating organization:", err);
      setOrganizationMessage({ type: "error", message: t("admin_settings.organization_update_error") });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmitOrganization)} className="space-y-4 sm:space-y-6">
      <section className="border border-gray-200 dark:border-gray-800 rounded-xl p-4 sm:p-6 shadow-sm bg-white dark:bg-gray-900">
        <h2 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
          {t("admin_settings.organization_information")}
        </h2>

        <div className="space-y-4 sm:space-y-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            {t("admin_settings.organization_description")}
          </p>

          {organizationMessage && (
            <Message
              type={organizationMessage.type}
              message={organizationMessage.message}
              variant="filled"
              dismissible
              onDismiss={() => setOrganizationMessage(null)}
            />
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <Controller
              name="companyName"
              control={control}
              rules={{ required: t("common.required") as string }}
              render={({ field }) => (
                <CustomInput
                  label={t("admin_settings.company_name")}
                  placeholder={t("admin_settings.company_name_placeholder")}
                  value={field.value}
                  onChange={field.onChange}
                  required
                  error={errors.companyName?.message as string}
                />
              )}
            />

            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <CustomInput
                  label={t("admin_settings.email")}
                  type="email"
                  placeholder={t("admin_settings.email_placeholder")}
                  value={field.value}
                  onChange={field.onChange}
                  disabled
                  error={errors.email?.message as string}
                />
              )}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <CustomInput
                  label={t("admin_settings.phone")}
                  placeholder={t("admin_settings.phone_placeholder")}
                  value={field.value || ""}
                  onChange={field.onChange}
                  error={errors.phone?.message as string}
                />
              )}
            />
          </div>

          <Controller
            name="address"
            control={control}
            render={({ field }) => (
              <CustomTextarea
                label={t("admin_settings.address")}
                placeholder={t("admin_settings.address_placeholder")}
                rows={3}
                value={field.value || ""}
                onChange={field.onChange}
                error={errors.address?.message as string}
              />
            )}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <Controller
              name="taxId"
              control={control}
              render={({ field }) => (
                <CustomInput
                  label={t("admin_settings.tax_id")}
                  placeholder={t("admin_settings.tax_id_placeholder")}
                  value={field.value || ""}
                  onChange={field.onChange}
                  error={errors.taxId?.message as string}
                />
              )}
            />

            <Controller
              name="registrationNumber"
              control={control}
              render={({ field }) => (
                <CustomInput
                  label={t("admin_settings.registration_number")}
                  placeholder={t("admin_settings.registration_number_placeholder")}
                  value={field.value || ""}
                  onChange={field.onChange}
                  error={errors.registrationNumber?.message as string}
                />
              )}
            />
          </div>
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

export default OrganizationInfo;