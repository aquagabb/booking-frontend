import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pencil, Trash2, Plus } from "lucide-react";
import { getLocationById, updateLocationPricing } from "../../../../api/locations/locations";
import { getGeneralData } from "../../../../api/others/others";
import { toSelectOptions } from "../../../../lib/utils";
import { PricingForm } from "../../../../components/shared/PricingForm";
import { CategoryPricingModal } from "../../../../components/admin/CategoryPricingModal";
import type {
  PricingItem,
  PricingFormValues,
  LocationPricingData,
  SelectOption,
} from "../../../../types/pricing";
import {
  buildPricingData,
  parsePricingData,
  buildLocationPricingForAPI,
  parseLocationPricingFromAPI,
  formatPricingSummary,
} from "../../../../utils/pricing";

type PricingProps = {
  slug?: string;
};

const Pricing: React.FC<PricingProps> = ({ slug }) => {
  const { t } = useTranslation();

  let locationId: number | null = null;
  if (slug && slug !== "new") {
    const firstPart = slug.split("-")[0];
    const parsed = Number(firstPart);
    if (!Number.isNaN(parsed)) {
      locationId = parsed;
    }
  }

  const [defaultPricingValues, setDefaultPricingValues] = useState<PricingFormValues>({
    currency: "EUR",
    pricing_mode: null,
    price_per_hour: null,
    price_per_day: null,
    price_per_guest: null,
    min_hours: null,
    min_guests: null,
    isPoa: true,
  });

  const [categoryPricing, setCategoryPricing] = useState<Record<number, PricingItem[]>>({});
  const [categoryPricingIds, setCategoryPricingIds] = useState<Record<number, number>>({});
  const [isCategoryPricingModalOpen, setIsCategoryPricingModalOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<number | undefined>(undefined);

  const [categories, setCategories] = useState<number[]>([]);
  const [options, setOptions] = useState<{
    categories: SelectOption[];
  }>({
    categories: [],
  });

  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Stare salvată (după fetch/save) pentru a afișa "modificat" pe itemuri
  const [savedDefaultPricing, setSavedDefaultPricing] = useState<PricingFormValues | null>(null);
  const [savedCategoryPricing, setSavedCategoryPricing] = useState<Record<number, PricingItem[]>>(
    {}
  );

  const fetchLocation = async () => {
    if (!locationId) {
      setIsLoading(false);
      return;
    }

    const { environment, response } = await getLocationById(locationId);

    if (environment.status === 200 && response?.data) {
      const loc = response.data;

      setCategories(loc.categories || []);

      
      const locationPricingData = parseLocationPricingFromAPI({
        pricing: loc.pricing,
        categoryPricing: loc.categoryPricing,
        pricingCategories: loc.pricingCategories,
      });

      const defaultVals = parsePricingData(locationPricingData.defaultPricing);
      setDefaultPricingValues(defaultVals);
      setCategoryPricing(locationPricingData.categoryPricing);
      setCategoryPricingIds(locationPricingData.categoryPricingIds || {});
      setSavedDefaultPricing(defaultVals);
      setSavedCategoryPricing(locationPricingData.categoryPricing);
    }
    setIsLoading(false);
  };

  const fetchGeneralData = async () => {
    const { environment, response } = await getGeneralData();

    if (environment.status !== 200) return;

    setOptions({
      categories: toSelectOptions(response?.data?.categories),
    });
  };

  useEffect(() => {
    const loadAll = async () => {
      try {
        await fetchGeneralData();
        if (locationId) {
          await fetchLocation();
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error loading data:", error);
        setIsLoading(false);
      }
    };

    loadAll();
  }, [slug]);

  const handleCategoryPricingSave = (categoryId: number, pricing: PricingItem[] | null) => {
    if (pricing) {
      setCategoryPricing((prev) => ({
        ...prev,
        [categoryId]: pricing,
      }));
    } else {
      setCategoryPricing((prev) => {
        const updated = { ...prev };
        delete updated[categoryId];
        return updated;
      });
    }
  };

  const handleOpenCategoryPricingModal = (categoryId?: number) => {
    setEditingCategoryId(categoryId);
    setIsCategoryPricingModalOpen(true);
  };

  const handleDeleteCategoryPricing = (categoryId: number) => {
    setCategoryPricing((prev) => {
      const updated = { ...prev };
      delete updated[categoryId];
      return updated;
    });
    setCategoryPricingIds((prev) => {
      const updated = { ...prev };
      delete updated[categoryId];
      return updated;
    });
  };

  const handleSave = async () => {
    if (!locationId) return;

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const pricingData: LocationPricingData = {
        defaultPricing: buildPricingData(defaultPricingValues),
        categoryPricing: categoryPricing,
        categoryPricingIds,
      };

      const pricingForAPI = buildLocationPricingForAPI(pricingData);

      const body: any = {
        id: locationId,
        ...pricingForAPI,
      };

      const { environment } = await updateLocationPricing(body);

      if (environment.status === 200) {
        setFeedback({ type: "success", message: t("common.update_success") });
        setSavedDefaultPricing(defaultPricingValues);
        setSavedCategoryPricing(categoryPricing);
        await fetchLocation();
      } else {
        setFeedback({ type: "error", message: t("common.update_error") });
      }
    } catch (error) {
      setFeedback({ type: "error", message: t("common.update_error") });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="px-6 py-6 mx-auto max-w-4xl flex items-center justify-center h-64">
        <p className="text-sm font-normal text-gray-500 dark:text-gray-400">{t("common.loading")}</p>
      </div>
    );
  }

  if (!locationId) {
    return (
      <div className="px-6 py-6 mx-auto max-w-4xl flex items-center justify-center h-64">
        <p className="text-sm font-normal text-gray-500 dark:text-gray-400">
          {t("locations.no_location_selected") || "Nu există locație selectată."}
        </p>
      </div>
    );
  }

  const isDefaultModified =
    savedDefaultPricing != null &&
    JSON.stringify(defaultPricingValues) !== JSON.stringify(savedDefaultPricing);

  const isCategoryModified = (categoryId: number) => {
    const current = categoryPricing[categoryId];
    const saved = savedCategoryPricing[categoryId];
    if (current == null && saved == null) return false;
    if (current == null || saved == null) return true;
    return JSON.stringify(current) !== JSON.stringify(saved);
  };

  return (
    <div className="max-w-5xl h-full flex flex-col">
      <div className="flex-1 overflow-y-auto space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              {t("locations.default_pricing")}
            </h3>
            {isDefaultModified && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300">
                {t("common.modified")}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
            {t("locations.default_pricing_description")}
          </p>
          <PricingForm
            values={defaultPricingValues}
            onChange={setDefaultPricingValues}
            mode="default"
            showCurrency={true}
          />
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                {t("locations.category_pricing_overrides")}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {t("locations.category_pricing_description")}
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleOpenCategoryPricingModal()}
              className="btn-outline text-white flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {t("locations.add_category_pricing")}
            </button>
          </div>

          {(() => {
            const validCategoryPricing = Object.entries(categoryPricing).filter(([categoryId]) =>
              categories.includes(Number(categoryId))
            );
            return validCategoryPricing.length > 0 ? (
              <div className="space-y-2">
                {validCategoryPricing.map(([categoryId, pricing]) => {
                  const category = options.categories.find(
                    (cat) => Number(cat.value) === Number(categoryId)
                  );
                  const pricingValues = parsePricingData(pricing);

                  return (
                    <div
                      key={categoryId}
                      className="group flex items-center gap-4 py-3 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/60 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50/80 dark:hover:bg-gray-800/80 transition-all duration-200 shadow-sm hover:shadow"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                            {category?.label || t("locations.category_label_fallback", { id: categoryId })}
                          </span>
                          {isCategoryModified(Number(categoryId)) && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 shrink-0">
                              {t("common.modified")}
                            </span>
                          )}
                          {pricingValues.isPoa && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shrink-0">
                              {t("locations.price_on_application")}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {formatPricingSummary(pricingValues, { t })}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 focus-within:opacity-100">
                        <button
                          type="button"
                          onClick={() => handleOpenCategoryPricingModal(Number(categoryId))}
                          title={t("common.edit")}
                          aria-label={t("common.edit")}
                          className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-primary/30 hover:text-primary transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCategoryPricing(Number(categoryId))}
                          title={t("common.delete")}
                          aria-label={t("common.delete")}
                          className="p-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-gray-500 dark:text-gray-400 italic py-2">
                {t("locations.no_category_pricing")}
              </p>
            );
          })()}
        </div>
      </div>

      <CategoryPricingModal
        open={isCategoryPricingModalOpen}
        onClose={() => {
          setIsCategoryPricingModalOpen(false);
          setEditingCategoryId(undefined);
        }}
        categoryOptions={options.categories}
        selectedLocationCategories={categories}
        categoryIdsWithOverride={Object.keys(categoryPricing).map(Number)}
        defaultCurrency={defaultPricingValues.currency || "EUR"}
        initialCategoryId={editingCategoryId}
        initialPricing={editingCategoryId ? categoryPricing[editingCategoryId] : null}
        onSave={handleCategoryPricingSave}
      />

      <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-3 bg-white dark:bg-gray-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {feedback && (
              <div
                className={`text-sm font-normal px-3 py-1 rounded-lg ${
                  feedback.type === "success"
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                }`}
              >
                {feedback.message}
              </div>
            )}
          </div>
          <div>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? t("common.saving") : t("common.save")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
