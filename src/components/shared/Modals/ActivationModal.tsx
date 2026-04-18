import React, { useEffect, useRef, useState } from "react";
import { verifyCode } from "../../../api/users/users";
import { useTranslation } from "react-i18next";

interface ActivationModalProps {
  isOpen: boolean;
  email: string | null;
  type: "activation" | "change_password";
  onClose: () => void;
  onActivationSuccess: () => void;
}

const RESEND_INTERVAL = 60; // secunde (poți schimba la 120 sau 300)

const ActivationModal: React.FC<ActivationModalProps> = ({
  isOpen,
  email,
  type,
  onActivationSuccess,
  onClose,
}) => {
  const { t } = useTranslation();

  const [values, setValues] = useState(["", "", "", "", "", ""]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState<number>(0);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (isOpen) {
      setValues(["", "", "", "", "", ""]);
      setIsSubmitting(false);
      setErrorMsg(null);
      setCooldown(0);
      setTimeout(() => inputsRef.current[0]?.focus(), 0);
    }
  }, [isOpen]);

  // timer pentru cooldown
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  if (!isOpen) return null;

  const handleChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newValues = [...values];
    newValues[index] = value;
    setValues(newValues);

    if (errorMsg) setErrorMsg(null);

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !values[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = async (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").trim();
    const digits = pasted.replace(/\D/g, "").slice(0, 6).split("");

    if (digits.length === 0) return;

    const newValues = [...values];
    for (let i = 0; i < 6; i++) {
      newValues[i] = digits[i] || "";
    }
    setValues(newValues);

    if (digits.length === 6) {
      await verifyNow(digits.join(""));
    } else {
      inputsRef.current[digits.length]?.focus();
    }
  };

  const verifyNow = async (code: string) => {
    setIsSubmitting(true);

    const { status } = await verifyCode({
      email,
      code,
      type,
    }).finally(() => setIsSubmitting(false));

    if (status !== 204) {
      setErrorMsg(t("auth.invalid_code") || "Invalid code");
      return;
    }

    onActivationSuccess();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await verifyNow(values.join(""));
  };

  const handleResend = async () => {
    if (cooldown > 0 || !email) return;

    try {
      console.log("Resend activation code triggered for", email);

      setCooldown(RESEND_INTERVAL);
    } catch (err) {
      console.error("Error resending activation code", err);
    }
  };

  const isDisabled = values.join("").length !== 6 || isSubmitting;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
    // ex: 1:05
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-sm p-6">
        <h2 className="text-xl font-semibold mb-2">
          {t("auth.check_email") || "Check your email"}
        </h2>

        <p className="text-gray-600 text-sm">
          Enter the 6-digit code we sent to{" "}
          <span className="font-medium">{email}</span>.
        </p>

        {errorMsg && (
          <p
            className="mt-3 text-sm text-red-600"
            role="alert"
            aria-live="polite"
          >
            {errorMsg}
          </p>
        )}

        {/* mesaj si timer pentru resend */}


        <form onSubmit={handleSubmit} className="mt-6">
          <div className="flex justify-between">
            {values.map((v, i) => (
              <input
                key={i}
                ref={(el) => (inputsRef.current[i] = el)}
                value={v}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onPaste={i === 0 ? handlePaste : undefined}
                inputMode="numeric"
                aria-label={`Digit ${i + 1}`}
                maxLength={1}
                className="w-10 h-12 text-center border border-gray-300 rounded-lg text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-primary transition"
              />
            ))}
          </div>
{/* 
          {errorMsg && (
            <p
              onClick={handleResend}
              className="cursor-pointer hover:underline mt-2"
            >
              Click here to resend the activation code
            </p>
          )} */}

          <div className="flex gap-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="btn-outline-transparent w-full"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isDisabled}
              className="btn-primary w-full"
            >
              {isSubmitting ? "Verifying..." : "Verify Code"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ActivationModal;
