import React, { useCallback } from "react";
import googleLogo from "../../assets/google.png";

/**
 * Generates a cryptographically secure random string.
 * Uses crypto API instead of Math.random() for better entropy.
 */
const generateRandomString = (length: number): string => {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  const charset =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from(array, (byte) => charset[byte % charset.length]).join("");
};

interface GoogleAuthButtonProps {
  redirectPath?: string;
}

/**
 * Component for Google OAuth 2.0 Authentication Button.
 */
const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({ redirectPath }) => {
  const handleLogin = useCallback(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.error("Missing VITE_GOOGLE_CLIENT_ID in environment variables.");
      return;
    }

    const params = new URLSearchParams({
      access_type: "offline",
      client_id: clientId,
      redirect_uri: import.meta.env.VITE_GOOGLE_REDIRECT_URI,
      response_type: "code",
      scope: "email profile",
      state: generateRandomString(16),
      prompt: "select_account",
    });

    localStorage.setItem("oauth_state", params.get("state")!);
    
    // Salvează redirectPath în localStorage pentru a-l folosi în GoogleCallback
    if (redirectPath) {
      localStorage.setItem("oauth_redirect_path", redirectPath);
    }

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

    window.location.assign(authUrl);
  }, [redirectPath]);

  return (
    <button
      type="button"
      onClick={handleLogin}
      className="w-full flex items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 font-medium shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
    >
      <img src={googleLogo} alt="Google" className="w-5 h-5" />
      Continue with Google
    </button>
  );
};

export default GoogleAuthButton;
