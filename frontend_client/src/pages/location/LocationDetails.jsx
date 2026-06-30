import {
  Check,
  Users,
  Car,
  ParkingCircle,
  Clock,
  Utensils,
  Trees,
  ClipboardList,
  Info,
  Flower2,
  Cake,
  Coffee,
  Package,
  Mic2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import SeatingPlanIcon from "../../components/shared/SeatingPlanIcon";
import dummyData from "./dummy.json";

const ADDON_FALLBACK_ICONS = {
  item: Flower2,
  flat_fee: Package,
  hour: Mic2,
  person: Coffee,
};

const INITIAL_ADDONS_VISIBLE = 4;

const formatAddonPrice = (price) =>
  new Intl.NumberFormat("ro-RO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);

const AddonItem = ({ addon, typeLabel }) => {
  const FallbackIcon = ADDON_FALLBACK_ICONS[addon.type] || Cake;

  return (
    <div className="group flex items-start gap-4">
      <div className="w-20 h-20 shrink-0 rounded-lg border border-gray-200 bg-gray-50 overflow-hidden flex items-center justify-center">
        {addon.photo ? (
          <img
            src={addon.photo}
            alt={addon.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <FallbackIcon size={28} className="text-gray-400" strokeWidth={1.5} />
        )}
      </div>

      <div className="flex-1 min-w-0 pt-0.5">
        <div className="flex items-start gap-2">
          <h3 className="text-base font-semibold text-gray-900 leading-snug">
            {addon.title}
          </h3>

          {addon.details && (
            <div className="relative shrink-0 group/info">
              <button
                type="button"
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                aria-label={addon.title}
              >
                <Info size={16} />
              </button>
              <div
                role="tooltip"
                className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 w-64 -translate-x-1/2 rounded-lg border border-gray-200 bg-white p-3 text-sm text-gray-600 shadow-lg opacity-0 invisible transition-all group-hover/info:opacity-100 group-hover/info:visible group-focus-within/info:opacity-100 group-focus-within/info:visible"
              >
                {addon.details}
              </div>
            </div>
          )}
        </div>

        <p className="mt-1 text-sm text-gray-500">
          {addon.type === "flat_fee" ? (
            <>
              {formatAddonPrice(addon.price)} € {typeLabel}
            </>
          ) : (
            <>
              {formatAddonPrice(addon.price)} € /{typeLabel}
            </>
          )}
        </p>
      </div>
    </div>
  );
};

const LocationDetails = ({ location }) => {
  const { t } = useTranslation();

  const features = location?.featuresList?.map(feature =>
    t(`features.${feature.label}`, { defaultValue: feature.label })
  ) || [];

  const rules = location?.rulesList?.map(rule =>
    t(`rules.${rule.label}`, { defaultValue: rule.label })
  ) || [];

  const seatingPlans = location?.seatingPlans || location?.seatingArrangements || [];

  const addons = useMemo(() => {
    const fromApi = location?.addons || location?.addOns || [];
    return [...fromApi, ...(dummyData.addons || [])];
  }, [location?.addons, location?.addOns]);

  const [showAllAddons, setShowAllAddons] = useState(false);

  const visibleAddons = showAllAddons ? addons : addons.slice(0, INITIAL_ADDONS_VISIBLE);
  const hasMoreAddons = addons.length > INITIAL_ADDONS_VISIBLE;

  const getAddonTypeLabel = (type) =>
    t(`restaurant.addons.type_${type}`, { defaultValue: type });

  const aboutText = useMemo(() => {
    return (
      location?.description ||
      t("restaurant.about_fallback", {
        name: location?.name,
        address: location?.address,
        maxGuests: location?.maxGuests,
      })
    );
  }, [location?.description, location?.name, location?.address, location?.maxGuests, t]);

  const [isExpanded, setIsExpanded] = useState(false);

  const wordCount = useMemo(() => {
    const trimmed = aboutText?.trim() || "";
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).filter(Boolean).length;
  }, [aboutText]);

  const shouldTruncate = wordCount > 120;

  useEffect(() => {
    setIsExpanded(false);
    setShowAllAddons(false);
  }, [location?.name, location?.address, location?.description]);

  const getHighlightIcon = (highlight) => {
    const iconMap = {
      free_parking: <Car size={18} />,
      private_parking: <ParkingCircle size={18} />,
      min_hours_booking: <Clock size={18} />,
      catering_services: <Utensils size={18} />,
      outdoor_area: <Trees size={18} />,
    };

    return iconMap[highlight] || <Check size={18} />;
  };

  return (
    <div className="space-y-10">
      <div className="space-y-6 border-b border-gray-200 pb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">{t("restaurant.about_this_place")}</h2>
          <p
            className={`text-gray-700 leading-relaxed text-[15px] whitespace-pre-line ${!isExpanded && shouldTruncate ? "line-clamp-5" : ""}`}
          >
            {aboutText}
          </p>
          {shouldTruncate && (
            <button
              type="button"
              onClick={() => setIsExpanded((v) => !v)}
              className="mt-2 text-sm font-medium text-gray-600 underline hover:text-gray-500 transition-colors"
              style={{ paddingLeft: "0px" }}
            >
              {isExpanded ? t("restaurant.show_less") : t("restaurant.show_more")}
            </button>
          )}
        </div>

        {(features?.length > 0 || location?.maxGuests) && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {location?.maxGuests && (
                <div className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition">
                  <Users size={18} />
                  <span className="text-sm text-gray-800">{t("restaurant.up_to_guests", { count: location.maxGuests })}</span>
                </div>
              )}

              {location?.highlights?.map((highlight, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition"
                >
                  {getHighlightIcon(highlight.label)}
                  <span className="text-sm text-gray-800">{t(`highlights.${highlight.label}`, { defaultValue: highlight.label })}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

     
      {seatingPlans.length > 0 && (
        <div className="border-b border-gray-200 pb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">{t("restaurant.seating_options")}</h2>

          <div className="space-y-4">
            {seatingPlans.map((plan) => (
              <div key={plan.id} className="flex items-center gap-4">
                <SeatingPlanIcon type={plan.name} />
                <div className="flex-1 min-w-0">
                  <span className="text-base font-medium text-gray-900 capitalize block">
                    {plan.name}
                  </span>
                  <p className="text-sm text-gray-500 mt-1">
                    {t(`restaurant.seating.${plan.name}`, { defaultValue: t("restaurant.seating.default") })}
                  </p>
                </div>
                <span className="text-sm text-gray-700 font-bold shrink-0 whitespace-nowrap">
                  {t("restaurant.up_to_people", { count: plan.guests })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

{addons.length > 0 && (
        <div className="border-b border-gray-200 pb-6">
          <div className="mb-4">
            <h2 className="text-2xl font-semibold text-gray-900">
              {t("restaurant.addons_title")}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {t("restaurant.addons_subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
            {visibleAddons.map((addon) => (
              <AddonItem
                key={addon.slug || addon.id || addon.title}
                addon={addon}
                typeLabel={getAddonTypeLabel(addon.type)}
              />
            ))}
          </div>

          {hasMoreAddons && (
            <button
              type="button"
              onClick={() => setShowAllAddons((v) => !v)}
              className="mt-4 text-sm font-medium text-gray-600 underline hover:text-gray-500 transition-colors"
            >
              {showAllAddons ? t("restaurant.addons_show_less") : t("restaurant.addons_show_all")}
            </button>
          )}
        </div>
      )}


      {features?.length > 0 && (
        <div className="border-b border-gray-200 pb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">{t("restaurant.facilities_features")}</h2>

          <ul className="flex flex-wrap gap-x-6 gap-y-4 text-sm text-gray-800">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center gap-2">
                <Check size={18} className="text-green-600" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {rules?.length > 0 && (
        <div className="border-b border-gray-200 pb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">{t("restaurant.space_rules")}</h2>
          <ul className="space-y-3">
            {rules.map((rule, index) => (
              <li key={index} className="flex items-start gap-2 text-gray-800 text-sm">
                <ClipboardList size={18} className="text-green-600 mt-1" />
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default LocationDetails;
