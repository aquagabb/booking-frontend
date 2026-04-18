import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { navigateToInternalPath } from "../lib/navigateInternal";
import { googleAuthentication } from "../api/users/users";
import { useTranslation } from "react-i18next";
import { useUserStore } from "../store/user.store";

type AuthStatus = "loading" | "success" | "error";

const GoogleCallback: React.FC = () => {
  const { t } = useTranslation();

  const navigate = useNavigate();
  const setUser = useUserStore((state) => state.setUser);

  const [status, setStatus] = useState<AuthStatus>("loading");
  const [message, setMessage] = useState(t("auth.connecting_google"));

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const code = searchParams.get('code');

  const handleGoogleAuth = async () => {


    // if (!state || state !== storedState) throw new Error(t("auth.security_validation_failed"));
    if (!code) return navigate("/login");

    localStorage.removeItem("oauth_state");
    
    // Verifică dacă există un redirectPath salvat în localStorage
    const redirectPath = localStorage.getItem("oauth_redirect_path");
    if (redirectPath) {
      localStorage.removeItem("oauth_redirect_path");
    }
    
    setMessage(t("auth.signing_in_google"));

    const { status, response } = await googleAuthentication({ code });
    if (status !== 200) return navigate("/login");

    console.log(response);
    setUser({
      id: response?.id,
      name: response?.name,
      email: response?.email,
      phone: response?.phone,
      role: response?.role,
      token: response?.accessToken,
    });

    setStatus("success");
    setMessage(t("auth.login_success"));
    navigateToInternalPath(navigate, redirectPath || "/settings/overview");

  };

  useEffect(() => {
    code && handleGoogleAuth();
  }, [code]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center px-6">
      <div
        className={`text-lg font-semibold ${status === "loading"
          ? "text-gray-700 animate-pulse"
          : status === "success"
            ? "text-green-600"
            : "text-red-600"
          }`}
      >
        {status === "success" && "✅ "}
        {status === "error" && "❌ "}
        {message}
      </div>
    </div>
  );
};

export default GoogleCallback;
