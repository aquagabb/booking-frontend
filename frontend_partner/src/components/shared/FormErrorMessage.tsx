import React from "react";

interface FormErrorMessageProps {
  message?: string | null;
}

const FormErrorMessage: React.FC<FormErrorMessageProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div
      role="alert"
      aria-live="polite"
      className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-700"
    >
      {message}
    </div>
  );
};

export default FormErrorMessage;
