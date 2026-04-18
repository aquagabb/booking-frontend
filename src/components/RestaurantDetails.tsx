import { Check, Users, Car, ParkingCircle, Clock, Utensils, Trees } from "lucide-react";
import { ClipboardList } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";


interface Feature {
  label: string;
  value: number;
}

interface Rule {
  label: string;
  value: number;
}

interface SeatingPlan {
  id: number;
  name: string;
  guests: number;
}

interface Location {
  name?: string;
  address?: string;
  description?: string;
  maxGuests?: number;
  featuresList?: Feature[];
  rulesList?: Rule[];
  seatingPlans?: SeatingPlan[];
  highlights?: Feature[];
}

interface RestaurantDetailsProps {
  location: Location;
}

const RestaurantDetails = ({ location }: RestaurantDetailsProps) => {
  const { t } = useTranslation();

  const features = location?.featuresList?.map(feature => 
    t(`features.${feature.label}`, { defaultValue: feature.label })
  ) || [];

  const rules = location?.rulesList?.map(rule => 
    t(`rules.${rule.label}`, { defaultValue: rule.label })
  ) || [];

  const seatingPlans = location?.seatingPlans || [];

  const aboutText = useMemo(() => {
    return (
      location?.description ||
      `Welcome to ${location?.name}, located at ${location?.address}. Experience exceptional dining with a capacity of up to ${location?.maxGuests} guests.`
    );
  }, [location?.description, location?.name, location?.address, location?.maxGuests]);

  const [isExpanded, setIsExpanded] = useState(false);

  const wordCount = useMemo(() => {
    const trimmed = aboutText?.trim() || "";
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).filter(Boolean).length;
  }, [aboutText]);

  const shouldTruncate = wordCount > 120;

  useEffect(() => {
    // Reset "Show more" when switching restaurants.
    setIsExpanded(false);
  }, [location?.name, location?.address, location?.description]);

  const getHighlightIcon = (highlight: string) => {
    const iconMap: Record<string, any> = {
      'free_parking': <Car size={18}/>,
      'private_parking': <ParkingCircle size={18}/>,
      'min_hours_booking': <Clock size={18} />,
      'catering_services': <Utensils size={18} />,
      'outdoor_area': <Trees size={18} />
    };

    return iconMap[highlight] || <Check size={18} />;
  };

  return (
    <div className="space-y-10">

      <div className="space-y-6 border-b border-gray-200 pb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">About this place</h2>
          <p
            className={`text-gray-700 leading-relaxed text-[15px] ${!isExpanded && shouldTruncate ? "line-clamp-5" : ""}`}
          >
            {aboutText}
          </p>
          {shouldTruncate && (
            <button
              type="button"
              onClick={() => setIsExpanded((v) => !v)}
              className="mt-2 text-sm font-medium text-gray-600 underline hover:text-gray-500 transition-colors"
              style={{ paddingLeft: '0px' }}
            >
              {isExpanded ? "Show less" : "Show more"}
            </button>
          )}
        </div>

        {(features?.length > 0 || location?.maxGuests) && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
       
              {location?.maxGuests && (
                <div className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition">
                  <Users size={18} />
                  <span className="text-sm text-gray-800">Up to {location.maxGuests} guests</span>
                </div>
              )}

              
              {location?.highlights?.map((highlight: Feature, index: number) => (
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
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Seating Options</h2>

          <div className="space-y-4">
            {seatingPlans.map((plan: SeatingPlan) => {
              const descriptions: Record<string, string> = {
                dining: "Perfect for formal dining events and meals.",
                standing: "Ideal for cocktail parties and networking events.",
                theater: "Great for presentations and conferences.",
                boardroom: "Set up for business meetings with a central table.",
                classroom: "For training sessions with rows of desks and chairs."
              };

              return (
                <div key={plan.id} className="flex flex-col">
                  <div className="flex justify-between items-baseline">
                    <span className="text-base font-medium text-gray-900 capitalize">
                      {plan.name}
                    </span>
                    <span className="text-sm text-gray-700 font-bold">up to {plan.guests} people</span>
                  </div>
                  <p className="text-sm text-gray-500">{descriptions[plan.name] || "Flexible seating arrangement."}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {features?.length > 0 && (
        <div className="border-b border-gray-200 pb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Facilities & Features</h2>

          <ul className="flex flex-wrap gap-x-6 gap-y-4 text-sm text-gray-800">
            {features.map((feature: string, index: number) => (
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
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Space Rules</h2>
          <ul className="space-y-3">
            {rules.map((rule: string, index: number) => (
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

export default RestaurantDetails;
