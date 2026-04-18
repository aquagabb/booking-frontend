import React from "react";
import { Dialog } from "@headlessui/react";
import { X } from "lucide-react";

interface CustomModalProps {
  open: boolean;
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

const CustomModal: React.FC<CustomModalProps> = ({
  open,
  title = "Create Booking",
  onClose,
  children,
  className,
}) => {
  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">

      <div className="fixed inset-0 bg-black/80" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel
          className={className || "relative bg-white rounded-xl h-[90vh] w-full max-w-3xl sm:min-w-[400px] flex flex-col overflow-hidden"}
        >
          <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
            <Dialog.Title className="text-lg font-semibold">
              {title}
            </Dialog.Title>
            <button
              onClick={onClose}
              className="p-2 rounded hover:bg-gray-100 transition"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2">{children}</div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default CustomModal;
