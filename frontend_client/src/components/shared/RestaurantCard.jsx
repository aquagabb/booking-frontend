import { useMemo } from 'react';
import ReactSlick from 'react-slick';
import { MapPin, Users, ChevronLeft, ChevronRight, Heart, Star } from 'lucide-react';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  getFavoriteEntryKey,
  useFavoritesStore,
} from '../../store/favorites.store';

const Slider = ReactSlick.default ?? ReactSlick;

function getDisplayPricing(eventTypeId, pricing, pricingCategories) {
  if (!pricing?.length && !pricingCategories?.length) return null;
  const categoryMatch = eventTypeId
    ? pricingCategories?.find((pc) => String(pc.categoryId) === eventTypeId)
    : undefined;
  const source = categoryMatch?.pricing?.[0] ?? pricing?.[0];
  if (!source) return null;
  if (source.isPoa) return { currency: source.currency ?? 'EUR', isPoa: true };
  const hourPrice = source.hour?.price != null && source.hour.price > 0 ? source.hour.price : undefined;
  const dayPrice = source.day?.price != null && source.day.price > 0 ? source.day.price : undefined;
  const guestPrice = source.guest?.price != null && source.guest.price > 0 ? source.guest.price : undefined;
  if (hourPrice == null && dayPrice == null && guestPrice == null) return null;
  return {
    currency: source.currency ?? 'EUR',
    hourPrice,
    dayPrice,
    guestPrice,
    isPoa: false,
  };
}

function formatCurrency(amount, currency) {
  if (currency === 'EUR') return `€${amount.toLocaleString()}`;
  if (currency === 'USD') return `$${amount.toLocaleString()}`;
  return `${amount.toLocaleString()} ${currency}`;
}

const CustomArrow = ({ direction, onClick, className, style }) => {
  const Icon = direction === 'left' ? ChevronLeft : ChevronRight;
  return (
    <div
      className={`${className ?? ''} absolute top-1/2 ${direction === 'left' ? 'left-2' : 'right-2'
        } z-10 transform -translate-y-1/2 
      bg-white rounded-full shadow p-1 cursor-pointer 
      opacity-0 group-hover:opacity-100 transition-opacity duration-200`}
      style={style}
      onClick={onClick}
    >
      <Icon size={20} />
    </div>
  );
};

const RestaurantCard = ({
  photos = [],
  name,
  address,
  maxGuests,
  slug,
  rating = 0,
  ratingCount = 0,
  viewFavorite = false,
  locationId,
  onToggleFavorite,
  pricing,
  pricingCategories,
}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const eventTypeId = searchParams.get('eventType');

  const isFavorite = useFavoritesStore((s) => {
    if (locationId == null || !viewFavorite) return false;
    const key = String(locationId);
    return s.favorites.some((f) => getFavoriteEntryKey(f) === key);
  });

  const addFavorite = useFavoritesStore((s) => s.addFavorite);
  const removeFavorite = useFavoritesStore((s) => s.removeFavorite);

  const displayPricing = useMemo(
    () => getDisplayPricing(eventTypeId, pricing, pricingCategories),
    [eventTypeId, pricing, pricingCategories]
  );

  const sliderSettings = {
    dots: true,
    arrows: true,
    infinite: true,
    speed: 400,
    slidesToShow: 1,
    slidesToScroll: 1,
    nextArrow: <CustomArrow direction="right" />,
    prevArrow: <CustomArrow direction="left" />,
  };

  const handleToggleFavorite = async () => {
    if (!locationId) return;

    try {
      if (isFavorite) {
        await removeFavorite(String(locationId));
        onToggleFavorite?.(locationId, false);
      } else {
        await addFavorite({
          id: String(locationId),
          name,
          lat: 0,
          lng: 0,
        });
        onToggleFavorite?.(locationId, true);
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  return (
    <div className="w-full rounded-sm overflow-hidden bg-white flex flex-col border border-gray-200">

      <div className="relative group">
        {photos.length > 1 ? (
          <Slider {...sliderSettings}>
            {photos.map((img, i) => (
              <div key={i}>
                <img
                  src={img}
                  alt={`${name}-${i}`}
                  className="object-cover w-full h-56"
                />
              </div>
            ))}
          </Slider>
        ) : (
          <img
            src={photos[0]}
            alt={name}
            className="object-cover w-full h-56"
          />
        )}

        {viewFavorite && locationId && (
          <button
            type="button"
            onClick={handleToggleFavorite}
            className="absolute top-3 right-3 z-10 bg-white shadow-md hover:scale-105 transition-all transition-colors"
            style={{ borderRadius: '50%', padding: '8px' }}
          >
            <Heart
              className={`w-4 h-4 transition-colors ${isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-400 hover:text-red-500'
                }`}
            />
          </button>
        )}
      </div>

      <div className="p-4 mt-2 flex flex-col gap-2 text-sm">

        <h3 className="text-base font-semibold line-clamp-2 truncate">{name}</h3>

        <div className="flex items-center gap-1 text-accent">
          <Star size={16} className="fill-current stroke-none" />
          <span>{rating || '0'}</span>
          <span className="text-gray-400">({ratingCount} reviews)</span>
        </div>
        <div className="flex items-center gap-1 text-gray-600">
          <Users size={14} className="shrink-0 text-gray-400" />
          <span>{maxGuests} guests</span>
        </div>

        <div className="flex items-center gap-1 text-gray-600">
          <MapPin size={14} className="shrink-0 text-gray-400" />
          <span className="truncate">{address}</span>
        </div>

        {displayPricing && (
          <div className="mt-1 flex flex-col gap-0.5">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0">
              {displayPricing.isPoa ? (
                <span className="text-base font-semibold text-gray-900">Price on request</span>
              ) : (
                <>
                  {displayPricing.hourPrice != null && (
                    <span className="text-base font-semibold text-gray-900">
                      From {formatCurrency(displayPricing.hourPrice, displayPricing.currency)}/hr
                    </span>
                  )}
                  {displayPricing.dayPrice != null && (
                    <span className="text-base font-semibold text-gray-900">
                      {displayPricing.hourPrice != null ? '' : 'From '}
                      {displayPricing.hourPrice != null && ' · '}
                      {formatCurrency(displayPricing.dayPrice, displayPricing.currency)}/day
                    </span>
                  )}
                  {displayPricing.guestPrice != null && (
                    <span className="text-base font-semibold text-gray-900">
                      {(displayPricing.hourPrice != null || displayPricing.dayPrice != null) && ' · '}
                      {displayPricing.hourPrice == null && displayPricing.dayPrice == null ? 'From ' : ''}
                      {formatCurrency(displayPricing.guestPrice, displayPricing.currency)}/guest
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        <button
          className="btn-outline mt-2 py-1 text-sm max-w-fit self-end"
          onClick={() => navigate(`/restaurants/${encodeURIComponent(slug)}`)}
        >
          {viewFavorite ? 'View Details' : 'Reserve Now'}
        </button>
      </div>
    </div>
  );
};

export default RestaurantCard;
