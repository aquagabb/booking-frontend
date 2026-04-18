import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import CustomModal from "../shared/Modals/CustomModal";
import { PricingForm } from "../shared/PricingForm";
import type { PricingFormValues, PricingItem, SelectOption } from "../../types/pricing";
import { parsePricingData, buildPricingData } from "../../utils/pricing";
import CustomSelect from "../shared/CustomSelect";

type CategoryPricingModalProps = {
  open: boolean;
  onClose: () => void;
  categoryOptions: SelectOption[];
  selectedLocationCategories: number[]; // Categoriile selectate pentru locație
  categoryIdsWithOverride?: number[]; // Categoriile care au deja preț special (excluse din select la add)
  defaultCurrency: string; // Moneda de la default pricing (nu se afișează în form)
  initialCategoryId?: number;
  initialPricing?: PricingItem[] | null;
  onSave: (categoryId: number, pricing: PricingItem[] | null) => void;
};

export const CategoryPricingModal: React.FC<CategoryPricingModalProps> = ({
  open,
  onClose,
  categoryOptions,
  selectedLocationCategories,
  categoryIdsWithOverride = [],
  defaultCurrency,
  initialCategoryId,
  initialPricing,
  onSave,
}) => {
  const { t } = useTranslation();
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    initialCategoryId || null
  );
  const [pricingValues, setPricingValues] = useState<PricingFormValues>(() => ({
    ...parsePricingData(initialPricing),
    currency: defaultCurrency,
  }));

  // Categoriile selectate pentru locație, excluzând pe cele care au deja override (în modul add)
  // La edit (initialCategoryId) păstrăm categoria curentă în listă ca să poată fi afișată ca value
  const availableCategories = categoryOptions.filter((cat) => {
    const id = Number(cat.value);
    if (!selectedLocationCategories.includes(id)) return false;
    const hasOverride = categoryIdsWithOverride.includes(id);
    if (hasOverride && id !== (initialCategoryId ?? null)) return false;
    return true;
  });

  useEffect(() => {
    if (open) {
      setSelectedCategoryId(initialCategoryId || null);
      setPricingValues({
        ...parsePricingData(initialPricing),
        currency: defaultCurrency,
      });
    }
  }, [open, initialCategoryId, initialPricing, defaultCurrency]);

  const handleSave = () => {
    if (!selectedCategoryId) return;
    // Categoria folosește mereu moneda de la default
    const pricingData = buildPricingData({ ...pricingValues, currency: defaultCurrency });
    onSave(selectedCategoryId, pricingData);
    onClose();
  };

  const handleCancel = () => {
    setSelectedCategoryId(initialCategoryId || null);
    setPricingValues(parsePricingData(initialPricing));
    onClose();
  };

  return (
    <CustomModal
      open={open}
      onClose={handleCancel}
      title={t("locations.category_pricing") || "Preț special pentru categorie"}
      className="relative bg-white dark:bg-gray-800 rounded-xl h-[90vh] w-full max-w-3xl sm:min-w-[500px] flex flex-col overflow-hidden"
    >
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">
            {t("locations.select_category") || "Selectează categoria"}
          </label>
          {availableCategories.length === 0 ? (
            <div className="p-3 border border-yellow-200 dark:border-yellow-800 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
              <p className="text-sm text-yellow-800 dark:text-yellow-300">
                {t("locations.no_categories_selected") || "Nu există categorii selectate pentru această locație. Vă rugăm să selectați cel puțin o categorie înainte de a adăuga prețuri speciale."}
              </p>
            </div>
          ) : (
            <>
              <CustomSelect
                options={availableCategories}
                value={
                  selectedCategoryId
                    ? availableCategories.find((opt) => Number(opt.value) === selectedCategoryId) || null
                    : null
                }
                onChange={(opt: any) => setSelectedCategoryId(opt ? Number(opt.value) : null)}
                placeholder={t("locations.select_category_placeholder") || "Selectează o categorie"}
                isDisabled={!!initialCategoryId}
              />
              {initialCategoryId && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {t("locations.category_locked_edit") || "Categoria nu poate fi schimbată în modul de editare."}
                </p>
              )}
            </>
          )}
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">
            {t("locations.pricing_configuration") || "Configurare preț"}
          </h3>
          <PricingForm
            values={pricingValues}
            onChange={setPricingValues}
            mode="category"
            showCurrency={false}
          />
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 bg-white dark:bg-gray-800">
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={handleCancel}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            {t("common.cancel") || "Anulează"}
          </button>
          <button
            onClick={handleSave}
            disabled={!selectedCategoryId}
            className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t("common.save") || "Salvează"}
          </button>
        </div>
      </div>
    </CustomModal>
  );
};

