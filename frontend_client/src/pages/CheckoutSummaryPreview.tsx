import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, Calendar, Clock, User, Mail, Phone } from 'lucide-react';

type PriceVariant = 'per_day' | 'per_hour' | 'per_guest' | 'on_request';

export type CheckoutSummaryPreviewProps = {
  location: any;
  bookingSummary?: any;
  restaurantSlug?: string;
};

const CheckoutSummaryPreview: React.FC<CheckoutSummaryPreviewProps> = ({
  location,
  bookingSummary,
  restaurantSlug,
}) => {
  const getMainImage = (): string | null => {
    if (!location?.photos) return null;

    for (const category of location.photos) {
      if (category.photos) {
        const visiblePhoto = category.photos.find((photo: any) => photo.isVisible);
        if (visiblePhoto) return visiblePhoto.url;
      }
    }
    return null;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const days = ['duminică', 'luni', 'marți', 'miercuri', 'joi', 'vineri', 'sâmbătă'];
    const months = [
      'ianuarie',
      'februarie',
      'martie',
      'aprilie',
      'mai',
      'iunie',
      'iulie',
      'august',
      'septembrie',
      'octombrie',
      'noiembrie',
      'decembrie',
    ];
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]}`;
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' });
  };

  const getPriceData = () => {
    const pricingData =
      bookingSummary?.pricing && bookingSummary.pricing.length > 0 ? bookingSummary.pricing[0] : null;

    const bookingType = bookingSummary?.bookingType || 'day';
    const currency = pricingData?.currency || 'EUR';

    let variant: PriceVariant = 'per_day';
    let perDay = 0;
    let perHour = 0;
    let perGuest = 0;

    if (pricingData) {
      if (bookingType === 'hour' && pricingData.hour?.price != null) {
        variant = 'per_hour';
        perHour = pricingData.hour.price;
      } else if (bookingType === 'day' && pricingData.day?.price != null) {
        variant = 'per_day';
        perDay = pricingData.day.price;
      } else if (bookingType === 'guest' && pricingData.guest?.price != null) {
        variant = 'per_guest';
        perGuest = pricingData.guest.price;
      }
    } else {
      variant = bookingSummary?.priceVariant || 'per_day';
      perDay = bookingSummary?.pricePerDay || 150;
      perHour = bookingSummary?.pricePerHour || 25;
      perGuest = bookingSummary?.pricePerGuest || 50;
    }

    return {
      variant,
      perDay,
      perHour,
      perGuest,
      currency,
      onRequest: null,
    };
  };

  const calculateDuration = () => {
    if (!bookingSummary?.checkIn || !bookingSummary?.checkOut) return '';
    const start = new Date(bookingSummary.checkIn);
    const end = new Date(bookingSummary.checkOut);
    const diffMs = end.getTime() - start.getTime();
    if (diffMs <= 0) return '';

    const totalMinutes = Math.floor(diffMs / (1000 * 60));
    const days = Math.floor(totalMinutes / (24 * 60));
    const remMinutes = totalMinutes % (24 * 60);

    const formatHm = (mins: number) => {
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      const hoursPart = h > 0 ? `${h} ${h === 1 ? 'oră' : 'ore'}` : '';
      const minutesPart = m > 0 ? `${m} ${m === 1 ? 'minut' : 'minute'}` : '';
      if (hoursPart && minutesPart) return `${hoursPart} și ${minutesPart}`;
      return hoursPart || minutesPart;
    };

    if (days > 0) {
      const dayPart = `${days} ${days === 1 ? 'zi' : 'zile'}`;
      if (remMinutes === 0) return dayPart;
      return `${dayPart}, ${formatHm(remMinutes)}`;
    }
    return formatHm(remMinutes);
  };

  const getDurationInHours = (): number => {
    if (!bookingSummary?.checkIn || !bookingSummary?.checkOut) return 0;
    const start = new Date(bookingSummary.checkIn);
    const end = new Date(bookingSummary.checkOut);
    const diffMs = end.getTime() - start.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60));
  };

  const getDurationInDays = (): number => {
    if (!bookingSummary?.checkIn || !bookingSummary?.checkOut) return 0;
    const start = new Date(bookingSummary.checkIn);
    const end = new Date(bookingSummary.checkOut);
    const diffMs = end.getTime() - start.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  };

  const calculateSubtotal = () => {
    const priceData = getPriceData();
    const variant = priceData.variant;

    if (variant === 'on_request') return null;

    if (variant === 'per_day') return priceData.perDay * Math.max(1, getDurationInDays());
    if (variant === 'per_hour') return priceData.perHour * Math.max(1, getDurationInHours());
    if (variant === 'per_guest') {
      const guests = bookingSummary?.guests || 1;
      return priceData.perGuest * guests;
    }

    return 0;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    if (subtotal === null) return null;
    return subtotal;
  };

  const getPriceLabel = () => {
    const priceData = getPriceData();
    const variant = priceData.variant;
    const currencySymbol = priceData.currency === 'RON' ? 'RON' : '€';

    if (variant === 'on_request') return 'Preț la cerere';

    if (variant === 'per_day') {
      const days = Math.max(1, getDurationInDays());
      return `${priceData.perDay} ${currencySymbol}/zi × ${days} ${days === 1 ? 'zi' : 'zile'}`;
    }

    if (variant === 'per_hour') {
      const hours = Math.max(1, getDurationInHours());
      return `${priceData.perHour} ${currencySymbol}/oră × ${hours} ${hours === 1 ? 'oră' : 'ore'}`;
    }

    if (variant === 'per_guest') {
      const guests = bookingSummary?.guests || 1;
      return `${priceData.perGuest} ${currencySymbol}/persoană × ${guests} ${guests === 1 ? 'persoană' : 'persoane'
        }`;
    }

    return '';
  };

  const mainImage = getMainImage();
  const slugForRestaurantPage = (restaurantSlug && String(restaurantSlug).trim()) || location?.slug;
  const total = calculateTotal();
  const subtotal = calculateSubtotal();
  const priceLabel = getPriceLabel();
  const durationLabel = calculateDuration();

  const contactName = String(bookingSummary?.customerName ?? '').trim();
  const contactEmail = String(bookingSummary?.customerEmail ?? '').trim();
  const contactPhone = String(bookingSummary?.customerPhone ?? '').trim();
  const hasContactDetails = Boolean(contactName || contactEmail || contactPhone);

  return (
    <>
      <div className="mb-4 flex">
        {mainImage && (
          <div className="mb-3 rounded-lg overflow-hidden">
            <img
              src={mainImage}
              alt={location.name}
              className="w-full h-36 object-cover rounded-lg"
            />
          </div>
        )}

        <div className="ml-4 flex-1">
          <div className="flex items-start justify-between mb-1">
            {slugForRestaurantPage ? (
              <Link
                to={`/restaurants/${slugForRestaurantPage}`}
                className="text-base font-semibold text-gray-900 line-clamp-2 hover:underline underline-offset-2"
                target="_blank"
              >
                {location.name}
              </Link>
            ) : (
              <h2 className="text-base font-semibold text-gray-900 line-clamp-2">{location.name}</h2>
            )}
          </div>

          <div className="flex items-center gap-1 text-accent mb-2">
            <Star size={16} className="fill-current stroke-none" />
            <span className="font-medium">{location.rating ?? '0'}</span>
            <span className="text-gray-400 text-sm">({location.ratingCount ?? 0} recenzii)</span>
          </div>

          <div className="flex items-start gap-2 text-gray-600 text-sm">
            <MapPin size={14} className="mt-0.5 flex-shrink-0" />
            <p className="leading-snug">{location.address}</p>
          </div>
        </div>
      </div>

      {bookingSummary?.checkIn && (
        <div className="space-y-3 mb-2 pb-4 border-b border-gray-200">
          <div className="flex items-center gap-2 text-gray-700">
            <Calendar size={18} className="text-gray-400" />
            <span className="text-sm font-medium">{formatDate(bookingSummary.checkIn)}</span>
          </div>

          {bookingSummary.checkOut && (
            <div className="flex items-center gap-2 text-gray-700">
              <Clock size={18} className="text-gray-400" />
              <span className="text-sm">
                {formatTime(bookingSummary.checkIn)} - {formatTime(bookingSummary.checkOut)}
                {durationLabel && ` (${durationLabel})`}
              </span>
            </div>
          )}
        </div>
      )}

      <div className="space-y-3 mb-4">
        {subtotal !== null ? (
          <>
            <div className="flex justify-between text-base font-semibold pt-1">
              <span className="text-gray-900">Total</span>
              <span>
                {total} {getPriceData().currency === 'RON' ? 'RON' : '€'}
              </span>
            </div>

            {priceLabel && <div className="text-xs text-gray-500 pb-1">{priceLabel}</div>}

            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Plătiți la locul de desfășurare</span>
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Preț</span>
              <span className="text-gray-900">La cerere</span>
            </div>

            <div className="flex justify-between text-base font-semibold pt-1">
              <span className="text-gray-900">Total</span>
              <span className="text-gray-600">La cerere</span>
            </div>

            {priceLabel && <div className="text-xs text-gray-500 pb-1">{priceLabel}</div>}

            <div className="flex justify-between text-sm pt-2">
              <span className="text-green-600">Plateste acum</span>
              <span className="text-green-600">0 RON</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Plătiți la locul de desfășurare</span>
              <span className="text-gray-900">La cerere</span>
            </div>
          </>
        )}
      </div>

      {bookingSummary?.categoryName && (
        <div className="border-t border-gray-200 pt-2">
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="min-w-0 flex-1 pt-0.5">
                <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500">
                  Tip eveniment
                </p>
                <p className="text-sm font-semibold text-gray-900 leading-snug">
                  {bookingSummary.categoryName}
                </p>
              </div>
            </div>
            {bookingSummary.guests != null && bookingSummary.guests > 0 && (
              <div className="flex gap-3 pt-2">
                <div className="min-w-0 flex-1 pt-0.5">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500">
                    Număr persoane
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {bookingSummary.guests}{' '}
                    {bookingSummary.guests === 1 ? 'persoană' : 'persoane'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    
      {hasContactDetails && (
        <div className="border-t border-gray-200 pt-3 space-y-3">
          <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500">
            Date de contact
          </p>
          {contactName && (
            <div className="flex items-start gap-2 text-gray-800 text-sm">
              <User size={16} className="text-gray-400 flex-shrink-0 mt-0.5" />
              <span className="leading-snug">{contactName}</span>
            </div>
          )}
          {contactEmail && (
            <div className="flex items-start gap-2 text-gray-800 text-sm">
              <Mail size={16} className="text-gray-400 flex-shrink-0 mt-0.5" />
              <span className="leading-snug break-all">{contactEmail}</span>
            </div>
          )}
          {contactPhone && (
            <div className="flex items-start gap-2 text-gray-800 text-sm">
              <Phone size={16} className="text-gray-400 flex-shrink-0 mt-0.5" />
              <span className="leading-snug">{contactPhone}</span>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default CheckoutSummaryPreview;
