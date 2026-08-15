import { useEffect, useState } from "react";
import PhotoModal from "./PhotoModal";
import { Plus, Edit2, Trash2 } from "lucide-react";
import FileUploader from "./FileUploader";

import {
  deletePhoto,
  deletePhotoCategory,
  getLocationPhotos,
  updatePhotoCategory,
  updatePhotoDetails,
  uploadFile,
} from "../../api/locations/locations";
import ConfirmModal from "../shared/Modals/ConfirmModal";
import type { Category, Photo } from "./types/types";
import CustomInput from "../shared/CustomInput";
import { useTranslation } from "react-i18next";


interface GalleryPhotosProps {
  locationId: number;
}

const GalleryPhotos = ({ locationId }: GalleryPhotosProps) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<
    (Photo & { categoryId: number; order?: number }) | null
  >(null);


  const { t } = useTranslation();

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

  const [deletingCategoryId, setDeletingCategoryId] = useState(0);

  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [categoryOrder, setCategoryOrder] = useState(1);


  // ---- Helpers ----
  const resetCategoryForm = () => {
    setEditingCategory(null);
    setCategoryName("");
    setCategoryOrder(1);
  };

  const fetchCategories = async () => {
    const { response, status } = await getLocationPhotos(locationId);
    if (status === 200) {
      setCategories(response);
    }
  };

  // ---- Handlers ----
  const handleDelete = async (photoId: number) => {
    const { status } = await deletePhoto(locationId, photoId);
    if (status === 200) {
      fetchCategories();
      setSelectedPhoto(null);
    }
  };

  const handleDeleteCategory = async (categoryId: number) => {
    setDeletingCategoryId(categoryId);
    setIsConfirmDeleteOpen(true);
  }


  const confirmDelete = async () => {
    const { status } = await deletePhotoCategory(locationId, deletingCategoryId)

    if (status === 200) {
      setIsConfirmDeleteOpen(false);
      setDeletingCategoryId(0);
      fetchCategories();
    }

  };


  const openAddCategory = () => {
    resetCategoryForm();
    setIsCategoryModalOpen(true);
  };

  const openEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setCategoryOrder(category.rating || 1);
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async () => {
    if (!categoryName.trim()) return;

    const body = {
      id: editingCategory?.id ?? 0,
      name: categoryName,
      rating: categoryOrder,
    };

    const { status } = await updatePhotoCategory(locationId, body);

    if (status === 200) {
      fetchCategories();
      setIsCategoryModalOpen(false);
      resetCategoryForm();
    }
  };

  const handleUpdatePhoto = async (updatedPhoto: {
    id: number;
    isVisible: boolean;
    categoryId: number;
    rating: number;
  }) => {
    const body = {
      isVisible: updatedPhoto.isVisible,
      categoryId: updatedPhoto.categoryId,
      rating: updatedPhoto.rating,
    };

    const { status } = await updatePhotoDetails(
      locationId,
      body,
      updatedPhoto.id
    );

    if (status === 200) {
      fetchCategories();
    }
  };

  const handleFileUpload = async (file: File, categoryId: number) => {
    const body = new FormData();
    body.append("photo", file);
    body.append("objectName", "location");
    body.append("rating", "0");
    body.append("categoryId", String(categoryId));

    const { status, response } = await uploadFile(locationId, body);

    if (status === 200) {
      await fetchCategories();
      setSelectedPhoto({ ...response, order: response?.rating || 0 });
    }
  };

  // ---- Lifecycle ----
  useEffect(() => {
    fetchCategories();
  }, []);

  // ---- Render ----
  return (
    <div className="space-y-4 mt-8 mb-8 h-auto overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Photo Gallery
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage your photos by category
          </p>
        </div>
        <button
          onClick={openAddCategory}
          className="btn-outline text-white flex items-center gap-1 px-3 py-1.5"
        >
          <Plus className="w-4 h-4" /> Create Category
        </button>
      </div>

      {/* Categories */}
      {categories.map((category) => (
        <div key={category.id} className="space-y-3">
          {category.id > 0 && (
            <div className="flex items-center gap-2 group">
              <h2
                onClick={() => openEditCategory(category)}
                className="block text-sm font-semibold text-gray-800"
              >
                {category.name}
              </h2>
              <button
                onClick={() => openEditCategory(category)}
                className="opacity-0 group-hover:opacity-100 transition"
              >
                <Edit2 className="w-4 h-4 text-gray-500 hover:text-gray-700" />
              </button>
              <button
                onClick={() => handleDeleteCategory(category.id)}
                className="opacity-0 group-hover:opacity-100 transition">
                <Trash2 className="w-4 h-4 text-gray-500 hover:text-gray-700" />
              </button>
            </div>
          )}

          {/* Photos */}
          <div className="flex flex-wrap gap-4">
            <FileUploader
              onFileUploaded={(file) => handleFileUpload(file, category.id)}
            />
            {category.photos.map((photo) => (
              <div
                key={photo.id}
                className="relative w-28 h-28 md:w-32 md:h-32 rounded-lg overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition"
                onClick={() =>
                  setSelectedPhoto({ ...photo, categoryId: category.id })
                }
              >
                <img
                  src={photo.url}
                  alt={category.name}
                  className={`w-full h-full object-cover hover:scale-105 transition-transform ${photo.isVisible === false ? "opacity-40" : ""
                    }`}
                />
                {photo.isVisible === false && (
                  <span className="absolute bottom-1 right-1 text-[10px] bg-yellow-500 text-white px-1.5 py-0.5 rounded">
                    Hidden
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4">
              {editingCategory ? "Edit Category" : "Add Category"}
            </h3>
            <div className="space-y-4">
              <CustomInput
                label={t("locations.categories_photos.name")}
                placeholder="Name"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
              />
              <CustomInput
                label={t("locations.categories_photos.order")}
                placeholder="Order"
                value={categoryOrder}
                onChange={(e) => setCategoryOrder(Number(e.target.value))}
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-3 py-1.5 rounded border text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveCategory}
                  className="bg-primary text-white px-3 py-1.5 rounded text-sm"
                >
                  Save
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Photo Modal */}
      {selectedPhoto && (
        <PhotoModal
          photo={selectedPhoto}
          categories={categories}
          onClose={() => setSelectedPhoto(null)}
          onDelete={handleDelete}
          onSave={handleUpdatePhoto}
        />
      )}

      <ConfirmModal
        isOpen={isConfirmDeleteOpen}
        title="Confirm deletion"
        text="Are you sure you want to delete this category?"
        cancelText="Cancel"
        confirmText="Delete"
        onClose={() => setIsConfirmDeleteOpen(false)}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default GalleryPhotos;
