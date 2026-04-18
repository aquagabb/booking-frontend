// components/Modals/PhotoModal.tsx
import React, { useState } from "react";
import { X, Trash2, Save } from "lucide-react";
import ConfirmModal from "../shared/Modals/ConfirmModal";
import type { Category, Photo } from "./types/types";


interface PhotoModalProps {
  photo: Photo;
  categories: Category[];
  onClose: () => void;
  onDelete: (id: number) => void;
  onSave: (updatedPhoto: Photo) => void;
}

const PhotoModal: React.FC<PhotoModalProps> = ({
  photo,
  categories,
  onClose,
  onDelete,
  onSave,
}) => {
  const [order, setOrder] = useState<number>(photo.rating || 1);
  const [isActive, setIsActive] = useState<boolean>(photo.isVisible !== false);
  const [categoryId, setCategoryId] = useState<number | undefined>(
    photo.categoryId
  );
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState<boolean>(false);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSave = () => {
    onSave({ ...photo, rating: order, isVisible: isActive, categoryId });
    onClose();
  };

  const confirmDelete = () => {
    onDelete(photo.id);
    setIsConfirmDeleteOpen(false);
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
    >
      <div className="bg-white rounded-lg w-[90%] h-[90%] flex overflow-hidden shadow-2xl relative">

        <div className="flex-1 flex items-center justify-center border-r">
          <img
            src={photo.url}
            alt="Selected"
            className={`max-w-5xl max-h-[65vh] object-contain rounded-xl ${!isActive ? "opacity-50" : ""
              }`}
          />
        </div>

        <div className="w-80 bg-white p-6 flex flex-col justify-between">

          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">Photo details</h3>
            <button onClick={onClose}>
              <X className="w-6 h-6 text-gray-500 hover:text-gray-800" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-6">

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Order
              </label>
              <input
                type="number"
                min={1}
                max={999}
                value={order}
                onChange={(e) => setOrder(Number(e.target.value))}
                className="w-full border rounded px-3 py-2 focus:ring focus:ring-blue-200"
              />
            </div>


            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Category
              </label>
              <select
                className="w-full border rounded px-3 py-2 focus:ring focus:ring-blue-200"
                value={categoryId}
                onChange={(e) => setCategoryId(Number(e.target.value))}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="isActive"
                type="checkbox"
                checked={isActive}
                onChange={() => setIsActive(!isActive)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="text-sm text-gray-700">
                Visible on site
              </label>
            </div>
          </div>


          <div className="space-y-3 mt-6">

            <button
              onClick={() => setIsConfirmDeleteOpen(true)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded border text-sm hover:bg-gray-100 transition"
            >
              <Trash2 className="w-4 h-4" /> Delete
            </button>


            <button
              onClick={handleSave}
              className="w-full bg-primary text-white flex items-center justify-center gap-2 px-3 py-2 rounded text-sm hover:bg-primary/90 transition"
            >
              <Save className="w-4 h-4" /> Save
            </button>
          </div>
        </div>

        <ConfirmModal
          isOpen={isConfirmDeleteOpen}
          title="Confirm deletion"
          text="Are you sure you want to delete this photo? This action cannot be undone."
          cancelText="Cancel"
          confirmText="Delete"
          onClose={() => setIsConfirmDeleteOpen(false)}
          onConfirm={confirmDelete}
        />
      </div>
    </div>
  );
};

export default PhotoModal;
