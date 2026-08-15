import Table from "../../Table";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Grid3x3, List, MapPin } from "lucide-react";

import { getLocations } from "../../../../../api/locations/locations";
import CustomModal from "../../../../../components/shared/Modals/CustomModal";
import { LocationForm } from "../LocationForm";

type PricingItem = {
    currency: string;
    defaultMode: "per_time" | "per_guest";
    hour?: {
        price: number;
    };
    day?: {
        price: number;
        min?: number;
    };
    guest?: {
        price: number;
        min?: number;
    };
};

type PhotoCategory = {
    name: string;
    photos?: Array<{
        id: number;
        url: string;
        isVisible: boolean;
    }>;
};

type Location = {
    id: string;
    slug: string;
    name: string;
    address: string;
    status: "active" | "draft" | "pending";
    createdAt: string;
    isVisible?: boolean;
    pricing?: PricingItem[];
    photos?: PhotoCategory[];
    firstImage?: string;
    maxGuests?: number;
    pendingEvents?: number;
    confirmedEvents?: number;
};

type ViewMode = "grid" | "table";


const columns = [
    "Name",
    "Pending Events",
    "Address",
    "Upcoming Events",
    "Pricing",
    "Visibility",
    "Created At",
];

const formatDateTime = (iso: string) =>
    new Intl.DateTimeFormat("en-GB", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(iso));

const formatPricing = (pricing?: PricingItem[]): string => {
    if (!pricing || pricing.length === 0) {
        return "N/A";
    }

    const pricingData = pricing[0];
    const currency = pricingData.currency || "EUR";
    const currencySymbol = currency === "RON" ? "RON" : currency === "EUR" ? "€" : currency;

    // Check for per_guest pricing
    if (pricingData.defaultMode === "per_guest" && pricingData.guest?.price != null) {
        return `${pricingData.guest.price} ${currencySymbol} / guest`;
    }

    // Check for per_time pricing (hour or day)
    if (pricingData.defaultMode === "per_time") {
        if (pricingData.hour?.price != null && pricingData.day?.price != null) {
            // Both hour and day available - show both
            return `${pricingData.hour.price} ${currencySymbol} / hour, ${pricingData.day.price} ${currencySymbol} / day`;
        } else if (pricingData.hour?.price != null) {
            return `${pricingData.hour.price} ${currencySymbol} / hour`;
        } else if (pricingData.day?.price != null) {
            return `${pricingData.day.price} ${currencySymbol} / day`;
        }
    }

    return "N/A";
};


const PropertiesList = () => {
    const [locations, setLocations] = useState<Location[]>([]);
    const [filters, setFilters] = useState({
        term: "",
        pageNumber: 1,
        pageSize: 10,
    });
    const [isModalNewBooking, setIsModalNewBooking] = useState(false);
    
    // Initialize viewMode from sessionStorage or default to "grid"
    const [viewMode, setViewMode] = useState<ViewMode>(() => {
        const savedViewMode = sessionStorage.getItem("propertiesViewMode");
        return (savedViewMode === "grid" || savedViewMode === "table") ? savedViewMode : "grid";
    });

    const fetchLocations = async () => {
        const { status, response } = await getLocations();
        if (status) {
            setLocations(response?.data || []);
        }
    };

    useEffect(() => {
        fetchLocations();
    }, [filters]);

    // Save viewMode to sessionStorage whenever it changes
    useEffect(() => {
        sessionStorage.setItem("propertiesViewMode", viewMode);
    }, [viewMode]);

    return (
        <div className="w-full space-y-6">
            <div className="bg-white rounded-xl shadow p-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Locations</h2>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 border border-gray-200 rounded-lg p-1">
                            <button
                                onClick={() => setViewMode("table")}
                                className={`p-2 rounded transition-all ${
                                    viewMode === "table"
                                        ? "text-primary"
                                        : "text-gray-400 hover:text-gray-600"
                                }`}
                                title="Table View"
                            >
                                <List className={`w-4 h-4 ${viewMode === "table" ? "stroke-2" : ""}`} />
                            </button>
                            <button
                                onClick={() => setViewMode("grid")}
                                className={`p-2 rounded transition-all ${
                                    viewMode === "grid"
                                        ? "text-primary"
                                        : "text-gray-400 hover:text-gray-600"
                                }`}
                                title="Grid View"
                            >
                                <Grid3x3 className={`w-4 h-4 ${viewMode === "grid" ? "stroke-2" : ""}`} />
                            </button>
                        </div>
                        <button
                            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition"
                            onClick={() => setIsModalNewBooking(true)}
                        >
                            Create Location
                        </button>
                    </div>
                </div>

                {viewMode === "table" ? (
                    <Table
                        title=""
                        columns={columns}
                        data={{ totalPages: 5 }}
                        filters={filters}
                        setFilters={(newFilters) => setFilters({
                            term: newFilters.term || "",
                            pageNumber: newFilters.pageNumber || 1,
                            pageSize: newFilters.pageSize || 10,
                        })}
                        showAddButton={false}
                    >
                        <TableData items={locations} />
                    </Table>
                ) : (
                    <GridView items={locations} />
                )}
            </div>

            <CustomModal
                open={isModalNewBooking}
                onClose={() => setIsModalNewBooking(false)}
                title="Create Location"
            >
                <LocationForm slug="new" />
            </CustomModal>
        </div>
    );
};


type TableDataProps = {
    items: Location[];
};

const TableData = ({ items }: TableDataProps) => {
    const navigate = useNavigate();

    return (
        <>
            {items && items.length > 0 ? (
                items.map((b) => (
                    <tr
                        key={b.id}
                        onClick={() => navigate(`/partner/properties/edit/${b.id}-${b.slug}?tab=overview`)}
                        className="border-b hover:bg-gray-50 transition-colors text-sm cursor-pointer"
                    >
                        <td className="py-3 px-4 font-medium text-gray-700">
                            {b.name}
                        </td>

                        <td className="py-3 px-4">
                        {b.pendingEvents || 0}
                        </td>

                        <td className="py-3 px-4">{b.address}</td>
                        <td className="py-3 px-4">{b.confirmedEvents || 0}</td>
                        <td className="py-3 px-4 text-gray-600">
                            {formatPricing(b.pricing)}
                        </td>
                        <td className="py-3 px-4">
                            {b.isVisible ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800/30">
                                    Active
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/30">
                                    Hidden
                                </span>
                            )}
                        </td>

                        <td className="py-3 px-4 text-gray-600">
                            {formatDateTime(b.createdAt)}
                        </td>
                    </tr>
                ))
            ) : (
                <tr>
                    <td colSpan={7} className="text-center py-6 text-gray-400">
                        No locations found
                    </td>
                </tr>
            )}
        </>
    );
};

type GridViewProps = {
    items: Location[];
};

const GridView = ({ items }: GridViewProps) => {
    if (!items || items.length === 0) {
        return (
            <div className="text-center py-12 text-gray-400">
                No locations found
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {items.map((location) => (
                <Link
                    key={location.id}
                    to={`/partner/properties/edit/${location.id}-${location.slug}?tab=overview`}
                    className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                >
                    {/* Image */}
                    <div className="w-full h-48 bg-gray-200 overflow-hidden">
                        {location.firstImage ? (
                            <img
                                src={location.firstImage}
                                alt={location.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <MapPin className="w-12 h-12" />
                            </div>
                        )}
                    </div>

                    {/* Content */}
                    <div className="p-3 space-y-2">
                        {/* Name */}
                        <h3 className="font-semibold text-gray-900 truncate">
                            {location.name}
                        </h3>

                        {/* Address */}
                        <div className="flex items-start gap-1.5 text-sm text-gray-600">
                            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span className="line-clamp-2">{location.address}</span>
                        </div>

                        {/* Events Info */}
                        <div className="flex items-center gap-3 text-xs">
                            <div className="flex items-center gap-1">
                                {location.pendingEvents && location.pendingEvents > 0 ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-orange-500 text-white">
                                        {location.pendingEvents} Pending
                                    </span>
                                ) : (
                                    <span className="text-gray-500">
                                        <span className="font-medium">{location.pendingEvents || 0}</span>
                                        <span> Pending</span>
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-1 text-gray-500">
                                <span className="font-medium">{location.confirmedEvents || 0}</span>
                                <span>Confirmed</span>
                            </div>
                        </div>

                        {/* Pricing */}
                        <div className="text-sm font-medium text-gray-700">
                            {formatPricing(location.pricing)}
                        </div>

                        {/* Status */}
                        <div>
                            {location.isVisible ? (
                                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800/30">
                                    Active
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/30">
                                    Hidden
                                </span>
                            )}
                        </div>

                        {/* Created At */}
                        <div className="text-xs text-gray-400">
                            {formatDateTime(location.createdAt)}
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
};

export default PropertiesList;
