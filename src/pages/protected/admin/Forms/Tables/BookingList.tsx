import clsx from "clsx";
import Table from "../../Table";
import { Edit2 } from "lucide-react";

import { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getBookings, getBookingMetadata } from "../../../../../api/bookings/bookings";
import { BookingFormBun } from "../BookingFormBun";

import CustomModal from "../../../../../components/shared/Modals/CustomModal";
import CustomSelect from "../../../../../components/shared/CustomSelect";
import { useTranslation } from "react-i18next";

export const BOOKING_STATUSES = {
    PENDING: 'pending',
    AWAITING_CLIENT: 'awaiting_client',
    ON_HOLD: 'on_hold',
    CONFIRMED: 'confirmed',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
} as const;

export const BOOKING_STATUS_LIST = [
    BOOKING_STATUSES.PENDING,
    BOOKING_STATUSES.AWAITING_CLIENT,
    BOOKING_STATUSES.ON_HOLD,
    BOOKING_STATUSES.CONFIRMED,
    BOOKING_STATUSES.COMPLETED,
    BOOKING_STATUSES.CANCELLED,
] as const;

export type BookingStatus = typeof BOOKING_STATUS_LIST[number];

type Booking = {
    id: string;
    code: string;
    slug: string;
    locationName: string;
    eventName: string;
    guests: number;
    customerName: string;
    customerEmail: string;
    customerId?: number;
    checkIn: string;
    checkOut: string;
    status: BookingStatus;
    createdAt: string;
    totalPrice?: number;
};

const columns = [
    "Code",
    "Location",
    "Event Type",
    "Guests",
    "Customer",
    "Status",
    "Price",
    "Check in",
    "Check out",
    "Actions",
];

const formatDateTime = (iso: string) =>
    new Intl.DateTimeFormat("en-GB", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(iso));

const formatPrice = (price?: number) => {
    if (!price && price !== 0) return "-";
    return `€${price.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatStatusLabel = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
};

const BookingList = ({ slug }: { slug: string }) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [availableLocations, setAvailableLocations] = useState<Array<{ id: string; name: string }>>([]);
    const [totalCount, setTotalCount] = useState<number>(0);

    const locationId = slug ? slug.split("-")[0] : undefined;
    const hasInitialized = useRef(false);

    // Initialize filters from URL query params
    const getInitialFilters = () => {
        const urlLocationId = searchParams.get("locationId") || '';
        const urlStatus = searchParams.get("status") || '';
        const urlTerm = searchParams.get("term") || '';
        const urlPageNumber = searchParams.get("pageNumber");
        const urlPageSize = searchParams.get("pageSize");

        return {
            term: urlTerm,
            pageNumber: urlPageNumber ? parseInt(urlPageNumber, 10) : 1,
            pageSize: urlPageSize ? parseInt(urlPageSize, 10) : 10,
            locationId: urlLocationId || locationId || '',
            status: urlStatus
        };
    };

    const [filters, setFilters] = useState(() => getInitialFilters());

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const { status, response } = await getBookingMetadata();
                if (status === 200 && response?.data?.locations) {
                    setAvailableLocations(response.data.locations);
                }
            } catch (error) {
                console.error("Error fetching locations:", error);
            }
        };
        fetchLocations();
    }, []);

    // Initialize filters from URL on mount (only once)
    useEffect(() => {
        if (hasInitialized.current) return;
        hasInitialized.current = true;
    }, []);

    const statusOptions = [
        { value: '', label: 'Select Status' },
        ...BOOKING_STATUS_LIST.map(status => ({
            value: status,
            label: formatStatusLabel(status)
        }))
    ];

    const locationOptions = useMemo(() => {
        const options = [
            { value: '', label: 'All Locations' },
            ...availableLocations.map(loc => ({
                value: loc.id.toString(),
                label: loc.name
            }))
        ];
        return options;
    }, [availableLocations]);

    const selectedStatus = statusOptions.find(opt => opt.value === filters.status) || statusOptions[0];
    const selectedLocation = locationOptions.find(opt => opt.value === (filters.locationId || '')) || locationOptions[0];

    const [isModalNewBooking, setIsModalNewBooking] = useState(false);
    const [editingBookingSlug, setEditingBookingSlug] = useState<string | null>(null);

    const fetchBookings = async () => {

        const queryParams: Record<string, string | number> = {};
        if (filters.locationId) {
            queryParams.locationId = filters.locationId;
        }
        if(filters.term) {
            queryParams.term = filters.term;
        }
        if (filters.pageNumber) {
            queryParams.pageNumber = filters.pageNumber;
        }
        if (filters.pageSize) {
            queryParams.pageSize = filters.pageSize;
        }
        if (filters.status) {
            queryParams.status = filters.status;
        }

        const { status, response } = await getBookings(queryParams);
        if (status) {
            setBookings(response?.data || []);
            setTotalCount(response?.count || 0);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, [filters]);

    // Update URL query params when filters change
    useEffect(() => {
        if (!hasInitialized.current) return;

        const params: Record<string, string> = {};
        
        if (filters.locationId) {
            params.locationId = filters.locationId;
        }
        if (filters.status) {
            params.status = filters.status;
        }
        if (filters.term) {
            params.term = filters.term;
        }
        if (filters.pageNumber && filters.pageNumber > 1) {
            params.pageNumber = filters.pageNumber.toString();
        }
        if (filters.pageSize && filters.pageSize !== 10) {
            params.pageSize = filters.pageSize.toString();
        }

        setSearchParams(params, { replace: true });
    }, [filters, setSearchParams]);

    const handleSetFilters = (newFilters: { term?: string; pageNumber?: number; pageSize?: number; locationId?: string; status?: string }) => {
        setFilters({
            term: newFilters.term ?? filters.term,
            pageNumber: newFilters.pageNumber ?? filters.pageNumber,
            pageSize: newFilters.pageSize ?? filters.pageSize,
            locationId: newFilters.locationId !== undefined ? newFilters.locationId : (locationId || filters.locationId),
            status: newFilters.status ?? filters.status,
        });
    };

    const handleStatusChange = (selectedOption: any) => {
        const statusValue = selectedOption?.value || '';
        handleSetFilters({ ...filters, status: statusValue, pageNumber: 1 });
    };

    const handleLocationChange = (selectedOption: any) => {
        const locationValue = selectedOption?.value || '';
        handleSetFilters({ ...filters, locationId: locationValue, pageNumber: 1 });
    };

    const totalPages = Math.ceil(totalCount / filters.pageSize) || 1;

    return (
        <div className="w-full h-full flex flex-col">
            <Table
                title="Bookings"
                columns={columns}
                data={{ totalPages }}
                filters={filters}
                setFilters={handleSetFilters}
                onAddClick={() => setIsModalNewBooking(true)}
                addButtonText="Create Booking"
                customFilters={
                    <div className="flex gap-4">
                        <div className="w-64">
                            <CustomSelect
                                value={selectedLocation}
                                onChange={handleLocationChange}
                                options={locationOptions}
                                placeholder="Filter by location"
                                isSearchable={false}
                            />
                        </div>
                        <div className="w-64">
                            <CustomSelect
                                value={selectedStatus}
                                onChange={handleStatusChange}
                                options={statusOptions}
                                placeholder="Filter by status"
                                isSearchable={false}
                            />
                        </div>
                    </div>
                }
            >
                <TableData items={bookings} onEdit={(slug) => setEditingBookingSlug(slug)} />
            </Table>


            <CustomModal
                open={isModalNewBooking}
                onClose={() => {
                    setIsModalNewBooking(false);
                    fetchBookings();
                }}
                title="Create Booking"
            >
                <BookingFormBun
                    slug="new"
                />
            </CustomModal>

            <CustomModal
                open={!!editingBookingSlug}
                onClose={() => {
                    setEditingBookingSlug(null);
                    fetchBookings();
                }}
                title={`Edit Booking - #${editingBookingSlug?.split("-")[1]}`}
            >
                {editingBookingSlug && (
                    <BookingFormBun
                        slug={editingBookingSlug}
                        isTitleHidden={true}
                    />
                )}
            </CustomModal>
        </div>
    );
};

type TableDataProps = {
    items: Booking[];
    onEdit: (slug: string) => void;
};

const TableData = ({ items, onEdit }: TableDataProps) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    
    return (
        <>
            {items && items.length > 0 ? (
                items.map((b) => (
                    <tr 
                        key={b.id} 
                        className="table-row cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => navigate(`/partner/bookings/edit/${b.id}-${b.code}?tab=overview`)}
                    >
                        <td className="table-cell">
                            #{b.code}
                        </td>
                        <td className="table-cell">{b.locationName}</td>
                        <td className="table-cell">{t(`bookings.event_type.${b.eventName}`, b.eventName)}</td>
                        <td className="table-cell">{b.guests}</td>

                    <td className="table-cell">
                        <div className="flex flex-col">
                            <span className="font-medium">{b.customerName}</span>
                            <span className="text-gray-500 text-xs">{b.customerEmail}</span>
                            {b.customerId === 0 && (
                                <span className="bg-gray-100 text-gray-700 x mt-2 max-w-fit px-2 py-0.5 rounded-sm text-xs font-semibold">
                                    Custom
                                </span>
                            )}
                        </div>
                    </td>

                    <td className="table-cell">
                        <span
                            className={clsx(
                                "px-3 py-1 rounded-md text-xs font-semibold capitalize",
                                b.status === BOOKING_STATUSES.CONFIRMED &&
                                "bg-green-100 text-green-700 ring-1 ring-green-200",
                                b.status === BOOKING_STATUSES.PENDING &&
                                "bg-yellow-100 text-yellow-700 ring-1 ring-yellow-200",
                                b.status === BOOKING_STATUSES.ON_HOLD &&
                                "bg-orange-100 text-orange-700 ring-1 ring-orange-200",
                                b.status === BOOKING_STATUSES.AWAITING_CLIENT &&
                                "bg-blue-100 text-blue-700 ring-1 ring-blue-200",
                                b.status === BOOKING_STATUSES.COMPLETED &&
                                "bg-purple-100 text-purple-700 ring-1 ring-purple-200",
                                b.status === BOOKING_STATUSES.CANCELLED &&
                                "bg-red-100 text-red-700 ring-1 ring-red-200"
                            )}
                        >
                            {b.status.replace(/_/g, ' ')}
                        </span>
                    </td>

                    <td className="table-cell font-semibold text-gray-900">
                        {formatPrice(b.totalPrice)}
                    </td>

                    <td className="table-cell-gray">
                        <span className="block">{formatDateTime(b.checkIn)}</span>
                    </td>
                    <td className="table-cell-gray">
                        <span className="block">{formatDateTime(b.checkOut)}</span>
                    </td>
                    <td className="table-cell">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit(`${b.id}-${b.code}`);
                            }}
                            className="p-2 text-gray-600 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
                            title="Edit booking"
                        >
                            <Edit2 className="w-4 h-4" />
                        </button>
                    </td>
                </tr>
            ))
        ) : (
            <tr>
                <td colSpan={10} className="text-center py-6 text-gray-400">
                    No bookings found
                </td>
            </tr>
        )}
        </>
    );
};

export default BookingList;
