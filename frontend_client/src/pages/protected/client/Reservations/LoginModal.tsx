import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";

import ActivationModal from "../../../../components/shared/Modals/ActivationModal";
import Login from "../../../auth/Login";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  /** După login (email sau Google), utilizatorul revine aici (ex. URL checkout cu query). */
  postLoginRedirect?: string;
}

const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  postLoginRedirect,
}) => {

  const [isModalActivation, setIsModalActivation] = useState(false);
  const [emailForActivation, setEmailForActivation] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setIsModalActivation(false);
      setEmailForActivation(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;


  const handleClose = () => {
    setIsModalActivation(false);
    setEmailForActivation(null);
    onClose();
  };

  const modalTree = (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
        <div className="w-full max-w-md relative">
          <Login isModal={true} handleClose={handleClose} postLoginRedirect={postLoginRedirect} />
        </div>
      </div>

      <ActivationModal
        isOpen={isModalActivation}
        email={emailForActivation}
        type="activation"
        onClose={() => {
          setIsModalActivation(false);
        }}
        onActivationSuccess={() => {
          setIsModalActivation(false);
        }}
      />
    </>
  );

  return createPortal(modalTree, document.body);
};

export default LoginModal;

