import { useNavigate, Link } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import CustomInput from "../../components/shared/CustomInput";
import { useTranslation } from "react-i18next";
import GoogleAuthButton from "../../components/shared/GoogleAuthButton";
import { signup } from "../../api/users/users";
import FormErrorMessage from "../../components/shared/FormErrorMessage";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type FormValues = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  terms: boolean;
  gdpr: boolean;
};

interface RegisterProps {
  redirectPath?: string;
}

const Register = ({ redirectPath }: RegisterProps = {}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    mode: "onChange",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      terms: true,
      gdpr: true,
    },
  });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data: FormValues) => {
    setErrorMsg(null);

    try {
      const { status } = await signup({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        gdpr: true,
        terms: true,
      });

      if (status !== 201) {
        setErrorMsg(t("auth.register_failed") || "Registration failed. Please try again.");
        return;
      }

      reset();
      navigate("/login", {
        state: {
          email: data.email,
          password: data.password,
          autoActivation: true,
          redirectPath: redirectPath || undefined,
        },
      });
    } catch (error) {
      console.error(error);
      setErrorMsg(t("auth.something_wrong") || "Something went wrong. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <div className="border border-gray-200 w-full max-w-[440px] p-2 rounded-sm">
        <div className="p-4">
          <h1 className="text-lg font-bold text-gray-800 leading-tight mb-1">
          Create an account
          </h1>
          <p className="text-base text-gray-600 mb-6 mt-4">
            {t("auth.register_description")}
          </p>

          <FormErrorMessage message={errorMsg} />

          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="space-y-4"
            autoComplete="off"
          >
            <Controller
              name="firstName"
              control={control}
              rules={{
                required: t("auth.validation.firstName_required") as string,
              }}
              render={({ field }) => (
                <CustomInput
                  label={t("auth.first_name")}
                  placeholder="Gabriel"
                  type="text"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.firstName?.message}
                />
              )}
            />

            <Controller
              name="lastName"
              control={control}
              rules={{
                required: t("auth.validation.lastName_required") as string,
              }}
              render={({ field }) => (
                <CustomInput
                  label={t("auth.last_name")}
                  placeholder="Popescu"
                  type="text"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.lastName?.message}
                />
              )}
            />

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
                  label={t("auth.email_address")}
                  placeholder={t("auth.enter_email_placeholder")}
                  type="email"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.email?.message}
                />
              )}
            />

            <Controller
              name="password"
              control={control}
              rules={{
                required: t("auth.validation.password_required") as string,
                minLength: {
                  value: 6,
                  message: t("auth.validation.password_min_length"),
                },
              }}
              render={({ field }) => (
                <CustomInput
                  label={t("auth.password")}
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.password?.message}
                  iconRight={
                    showPassword ? (
                      <EyeOff className="w-5 h-5 text-gray-500 hover:text-gray-700 transition-colors" />
                    ) : (
                      <Eye className="w-5 h-5 text-gray-500 hover:text-gray-700 transition-colors" />
                    )
                  }
                  onIconRightClick={() => setShowPassword(!showPassword)}
                />
              )}
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full"
            >
              {isSubmitting ? t("auth.registering") : t("auth.register")}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-grow h-px bg-gray-200" />
            <span className="text-sm text-gray-500">{t("auth.or_use_options")}</span>
            <div className="flex-grow h-px bg-gray-200" />
          </div>

          <div className="flex gap-3">
            <div className="flex-1 min-w-0 [&>button]:w-full [&>button]:h-12 [&>button]:rounded-lg [&>button]:flex [&>button]:items-center [&>button]:justify-center">
              <GoogleAuthButton redirectPath={redirectPath} />
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              {t("auth.has_account")}{" "}
              <Link to="/login" className="text-[#0061df] font-medium hover:underline">
                {t("auth.login")}
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-[13px] text-gray-500 mt-6 leading-relaxed">
          {t("auth.terms_privacy_agree")}{" "}
          <Link to="/terms" className="text-[#0061df] underline hover:no-underline">
            {t("auth.terms_and_conditions")}
          </Link>
          {" "}{t("auth.and")}{" "}
          <Link to="/privacy" className="text-[#0061df] underline hover:no-underline">
            {t("auth.privacy_statement")}
          </Link>
          .
        </p>
        <p className="text-center text-[12px] text-gray-400 mt-2">
          {t("auth.all_rights_reserved")} © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
};

export default Register;
