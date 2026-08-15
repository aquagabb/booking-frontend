import { useNavigate } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import CustomInput from "../components/shared/CustomInput";
import CustomSelect from "../components/shared/CustomSelect";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import FormErrorMessage from "../components/shared/FormErrorMessage";
import { useUserStore } from "../store/user.store";
import { useAdminStore } from "../store/admin.store";
import { register } from "../api/organizations/organizations";

type FormValues = {
  email: string;
  companyName: string;
  phone: string;
  address: string;
  countryCode: string;
  taxIdentificationNumber: string;
  registrationNumber: string;
};

const countries = [
  { value: "RO", label: "Romania" },
  { value: "BG", label: "Bulgaria" },
  { value: "US", label: "United States" },
  { value: "GB", label: "United Kingdom" },
  { value: "DE", label: "Germany" },
  { value: "FR", label: "France" },
  { value: "IT", label: "Italy" },
  { value: "ES", label: "Spain" },
  { value: "NL", label: "Netherlands" },
  { value: "BE", label: "Belgium" },
  { value: "AT", label: "Austria" },
  { value: "CH", label: "Switzerland" },
  { value: "PL", label: "Poland" },
  { value: "CZ", label: "Czech Republic" },
  { value: "HU", label: "Hungary" },
  { value: "GR", label: "Greece" },
  { value: "PT", label: "Portugal" },
  { value: "SE", label: "Sweden" },
  { value: "NO", label: "Norway" },
  { value: "DK", label: "Denmark" },
  { value: "FI", label: "Finland" },
];

const PartnerRegister = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, setUser } = useUserStore();
  const { setOrganization } = useAdminStore();

  const {
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    mode: "onChange",
    defaultValues: {
      email: "",
      companyName: "",
      phone: "",
      address: "",
      countryCode: "",
      taxIdentificationNumber: "",
      registrationNumber: "",
    },
  });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (user?.email) {
      setValue("email", user.email);
    }
  }, [user, setValue]);

  const onSubmit = async (data: FormValues) => {
    setErrorMsg(null);

    try {
      const { status, response } = await register({
        email: data.email,
        name: data.companyName,
        phone: data.phone,
        address: data.address,
        countryCode: data.countryCode,
        taxIdentificationNumber: data.taxIdentificationNumber,
        registrationNumber: data.registrationNumber,
      });

      if (status !== 200 && status !== 204) {
        setErrorMsg(
          t("auth.register_failed") || "Registration failed. Please try again."
        );
        return;
      }

      if (status === 200 && response) {
        setOrganization({
          id: response.id?.toString() || "",
          companyName: response.name || "",
          email: data.email,
        });

        if (user) {
          setUser({
            ...user,
            role: 'owner',
          });
        }

        reset();
        navigate("/partner/dashboard");
      }
    } catch (error) {
      console.error(error);
      setErrorMsg(
        t("auth.something_wrong") ||
          "Something went wrong. Please try again."
      );
    }
  };

  return (
    <div className="flex items-center justify-center">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white shadow-lg p-4 border border-gray-200 rounded-xl w-full max-w-sm space-y-1.5"
        autoComplete="off"
        noValidate
      >
        <h1 className="font-bold mb-3 text-center text-lg">
          {"Become a partner"}
        </h1>

        <FormErrorMessage message={errorMsg} />

        <Controller
          name="email"
          control={control}
          rules={{
            required: t("auth.validation.email_required") as string,
            pattern: {
              value: /^\S+@\S+\.\S+$/,
              message: t("auth.validation.email_invalid"),
            },
          }}
          render={({ field }) => (
            <CustomInput
              label={t("auth.email")}
              placeholder="company@example.com"
              type="email"
              value={field.value}
              onChange={field.onChange}
              error={errors.email?.message}
              disabled={!!user?.email}
            />
          )}
        />

        <Controller
          name="companyName"
          control={control}
          rules={{
            required:
              (t("admin_settings.company_name") || "Company Name") +
              " " +
              (t("common.required") || "is required"),
          }}
          render={({ field }) => (
            <CustomInput
              label={t("admin_settings.company_name") || "Company Name"}
              placeholder={t("admin_settings.company_name_placeholder") || "Enter company name"}
              type="text"
              value={field.value}
              onChange={field.onChange}
              error={errors.companyName?.message}
              required
            />
          )}
        />

        <Controller
          name="phone"
          control={control}
          rules={{
            required: (t("admin_settings.phone") || "Phone") + " " + (t("common.required") || "is required"),
          }}
          render={({ field }) => (
            <CustomInput
              label={t("admin_settings.phone") || "Phone"}
              placeholder={t("admin_settings.phone_placeholder") || "Enter phone number"}
              type="tel"
              value={field.value}
              onChange={field.onChange}
              error={errors.phone?.message}
              required
            />
          )}
        />

        <Controller
          name="address"
          control={control}
          rules={{
            required: (t("admin_settings.address") || "Address") + " " + (t("common.required") || "is required"),
          }}
          render={({ field }) => (
            <CustomInput
              label={t("admin_settings.address") || "Address"}
              placeholder={t("admin_settings.address_placeholder") || "Enter organization address"}
              type="text"
              value={field.value}
              onChange={field.onChange}
              error={errors.address?.message}
              required
            />
          )}
        />

        <Controller
          name="countryCode"
          control={control}
          rules={{
            required: "Country is required",
          }}
          render={({ field }) => {
            const selectedCountry = countries.find(c => c.value === field.value);
            return (
              <CustomSelect
                label="Country"
                value={
                  selectedCountry
                    ? { value: selectedCountry.value, label: selectedCountry.label }
                    : null
                }
                onChange={(selected: any) => {
                  field.onChange(selected?.value || "");
                }}
                options={countries}
                isSearchable={true}
                placeholder="Select country..."
                error={errors.countryCode?.message}
                required
              />
            );
          }}
        />

        <Controller
          name="taxIdentificationNumber"
          control={control}
          rules={{
            required: (t("admin_settings.tax_id") || "Tax ID") + " " + (t("common.required") || "is required"),
          }}
          render={({ field }) => (
            <CustomInput
              label={t("admin_settings.tax_id") || "Tax ID"}
              placeholder={t("admin_settings.tax_id_placeholder") || "Enter tax identification number"}
              type="text"
              value={field.value}
              onChange={field.onChange}
              error={errors.taxIdentificationNumber?.message}
              required
            />
          )}
        />

        <Controller
          name="registrationNumber"
          control={control}
          render={({ field }) => (
            <CustomInput
              label={t("admin_settings.registration_number") || "Registration Number"}
              placeholder={t("admin_settings.registration_number_placeholder") || "Enter registration number"}
              type="text"
              value={field.value}
              onChange={field.onChange}
              error={errors.registrationNumber?.message}
            />
          )}
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary text-white py-2 rounded-lg mt-3 hover:bg-primary/90 transition text-sm"
        >
          {isSubmitting
            ? t("auth.registering") || "Registering..."
            : t("partner.register_cta") || "Register"}
        </button>
      </form>
    </div>
  );
};

export default PartnerRegister;
