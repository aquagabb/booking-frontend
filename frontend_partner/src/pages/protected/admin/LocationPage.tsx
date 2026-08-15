import React from "react";
import { useParams } from "react-router-dom";
import { LocationForm } from "./Forms/LocationForm";
import TabList from "../../../components/shared/TabList";
import Overview from "./Locations/Overview";
import BookingList from "./Forms/Tables/BookingList";
import Pricing from "./Locations/Pricing";
import AvailabilitySettings from "./Locations/AvailabilitySettings";
import GeneralRules from "./Locations/AvailabilitySettings/GeneralRules";

const TABS = [
  { key: "overview", label: "Schedule & Calendar" },
  { key: "bookings", label: "Bookings" },
  { key: "details", label: "Details" },
  { key: "pricing", label: "Pricing" },
  { key: "rules", label: "Reguli de disponibilitate" },
];

const LocationPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  return (
    <div>
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <TabList tabs={TABS} defaultTab="overview">
          {(activeTab) => {
            switch (activeTab) {
              case "overview":
                return (
                  <div className="p-6">
                    <Overview />
                  </div>
                );
              case "details":
                return (
                  <div className="p-6">
                    <LocationForm slug={slug || "new"} />
                  </div>
                );
              case "bookings":
                return slug ? (
                  <div className="p-6">
                      <BookingList slug={slug} />
                  </div>
                ) : null;
              case "pricing":
                return (
                  <div className="p-6">
                    <Pricing slug={slug} />
                  </div>
                );
              case "rules":
                return (
                  <div className="p-6">
                    <AvailabilitySettings slug={slug} />
                  </div>
                );
              default:
                return null;
            }
          }}
        </TabList>
      </div>
    </div>
  );
};

export default LocationPage;
