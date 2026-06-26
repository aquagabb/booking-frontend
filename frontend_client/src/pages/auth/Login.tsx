import { useNavigate, useLocation, Link } from "react-router-dom";
import { navigateToInternalPath } from "../../lib/navigateInternal";
import { useUserStore } from "../../store/user.store";
import { login } from "../../api/users/users";
import { Controller, useForm } from "react-hook-form";
import CustomInput from "../../components/shared/CustomInput";
import { useTranslation } from "react-i18next";
import GoogleAuthButton from "../../components/shared/GoogleAuthButton";
import { useEffect, useState } from "react";
import ActivationModal from "../../components/shared/Modals/ActivationModal";
import FormErrorMessage from "../../components/shared/FormErrorMessage";
import { X, Eye, EyeOff } from "lucide-react";

type FormValues = {
  email: string;
  password: string;
};

const Login = ({
  isModal = false,
  handleClose,
  postLoginRedirect,
}: {
  isModal?: boolean;
  handleClose?: () => void;
  /** După login reușit (ex. modal checkout): rămâi pe această rută. Are prioritate după redirectPath din location.state. */
  postLoginRedirect?: string;
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const setUser = useUserStore((state) => state.setUser);

  const location = useLocation();
  const { email, password, autoActivation, redirectPath: redirectPathFromState } = location.state || {};
  /** În modal (checkout), URL-ul curent din prop bate mereu `location.state` — altfel state vechi poate lăsa doar `?eventType=1`. */
  const redirectAfterLogin =
    isModal && postLoginRedirect
      ? postLoginRedirect
      : redirectPathFromState || postLoginRedirect || "/settings/overview";
  /** Pentru Google OAuth nu folosim fallback la settings; doar redirect explicit. */
  const oauthReturnPath =
    isModal && postLoginRedirect
      ? postLoginRedirect
      : redirectPathFromState || postLoginRedirect;

  const [isModalActivation, setIsModalActivation] = useState(false);
  const [emailForActivation, setEmailForActivation] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setErrorMsg(null);

    try {
      const { status, response } = await login({
        email: data.email,
        password: data.password,
      });

      if (status === 404) {
        if (response.checkEmail === true) {
          setEmailForActivation(data.email);
          setIsModalActivation(true);
        }
        setErrorMsg(t("auth.activation_required") || "Account not activated. Please verify your email.");
        return;
      }

      if (status !== 200) {
        setErrorMsg(t("auth.login_failed") || "Invalid credentials. Please try again.");
        return;
      }

      setUser({
        id: response?.id,
        name: response?.name,
        email: response?.email,
        phone: response?.phone,
        role: response?.role,
        token: response?.accessToken,
        preferences: {
          language: response?.language,
          emailNotifications: response?.emailNotifications,
        }
      });

      reset();
      if (isModal && handleClose) handleClose();
      navigateToInternalPath(navigate, redirectAfterLogin);
    } catch (error) {
      console.error(error);
      setErrorMsg(t("auth.something_wrong") || "Something went wrong. Please try again.");
    }
  };

  useEffect(() => {
    if (email) {
      reset({
        email,
        password: password || "",
      });
    }

    if (autoActivation && email) {
      setEmailForActivation(email);
      setIsModalActivation(true);
    }
  }, [autoActivation, email, password, reset]);

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <div className="bg-white  border border-gray-200 w-full max-w-[440px] p-2 rounded-sm">
        <div className="p-4">
          {isModal && (
            <div className="flex justify-end -mt-2 -mr-2 mb-2">
              <button
                onClick={handleClose}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-600"
                aria-label="Close"
                type="button"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          <h1 className="text-lg font-bold text-gray-800 leading-tight mb-1">
            {t("auth.sign_in_or_create")}
          </h1>
          <p className="text-base text-gray-600 mb-6 mt-4">
            {t("auth.sign_in_description")}
          </p>

          <FormErrorMessage message={errorMsg} />

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
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

            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-sm text-[#0061df] hover:underline font-medium"
              >
                {t("auth.forgot_password")}
              </Link>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full"
            >
              {isSubmitting ? t("auth.logging_in") : t("auth.login")}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-grow h-px bg-gray-200" />
            <span className="text-sm text-gray-500">{t("auth.or_use_options")}</span>
            <div className="flex-grow h-px bg-gray-200" />
          </div>

          <div className="flex gap-3">
            <div className="flex-1 min-w-0 [&>button]:w-full [&>button]:h-12 [&>button]:rounded-lg [&>button]:flex [&>button]:items-center [&>button]:justify-center">
              <GoogleAuthButton redirectPath={oauthReturnPath} />
            </div>
           
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              {t("auth.no_account")}{" "}
              <Link to="/register" className="text-[#0061df] font-medium hover:underline">
                {t("auth.register")}
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

      <ActivationModal
        isOpen={isModalActivation}
        email={emailForActivation}
        type="activation"
        onClose={() => setIsModalActivation(false)}
        onActivationSuccess={() => {
          setIsModalActivation(false);
          setErrorMsg(null);
          handleSubmit(onSubmit)();
        }}
      />
    </div>
  );
};

export default Login;
