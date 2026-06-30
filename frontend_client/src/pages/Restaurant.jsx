import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LocationDetails from './location/LocationDetails';
import ImageGallery from '../components/ImageGallery';
import ReservationRight from '../components/ReservationRight';
import { MapPin, Star, Heart, Share2, Check, Share } from 'lucide-react';
import { addLocationToFavorite, checkIsFavoriteLocation, getHomePageLocations, getLocationBySlug, removeLocationFavorite } from '../api/locations/locations';
import { useEffect, useState } from 'react';
import { useUserStore } from '../store/user.store';
import RestaurantCard from '../components/shared/RestaurantCard';

const Restaurant = () => {
  const { t } = useTranslation();
  const { slug } = useParams();
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [copied, setCopied] = useState(false);
  const [homepageLocations, setHomepageLocations] = useState([]);

  const fetchLocationData = async (slug) => {
    try {
      setLoading(true);
      const { status, response } = await getLocationBySlug(slug);
      if (status === 200) {
        setLocation(response?.data);
        if (user) {
          checkFavoriteIsFavorite(response?.data.id);
        }
      }
    } catch (error) {
      console.error('Error fetching location data:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkFavoriteIsFavorite = async (id) => {
    try {
      const { status, response } = await checkIsFavoriteLocation(id);
      const isFavoriteLocation = response?.data?.isFavorite;
      setIsFavorite(isFavoriteLocation);
    } catch (error) {
      setIsFavorite(false);
    }
  }

  useEffect(() => {
    if (slug) {
      fetchLocationData(slug);
    }
  }, [slug]);

  useEffect(() => {
    let cancelled = false;

    const fetchHomepageLocations = async () => {
      try {
        const { response } = await getHomePageLocations();
        if (!cancelled) {
          setHomepageLocations(response?.data || []);
        }
      } catch (error) {
        console.error('Error fetching homepage locations:', error);
      }
    };

    fetchHomepageLocations();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleToggleFavorite = async () => {
    if (!location.id) return;

    // Redirect to login if user is not authenticated
    if (!user) {
      navigate('/login');
      return;
    }

    if (isFavorite) {
      const { status } = await removeLocationFavorite(location.id);
      if (status === 200) {
        setIsFavorite(false);
      }
    } else {
      const { status } = await addLocationToFavorite(location.id);
      if (status === 201) {
        setIsFavorite(true);
      }
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">{t('restaurant.loading')}</div>
      </div>
    );
  }

  if (!location) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-red-500">{t('restaurant.not_found')}</div>
      </div>
    );
  }

  const normalizePhotos = (photos) => {
    if (!photos?.length) return { allPhotos: [], photoCategories: [] };

    if (typeof photos[0] === 'string') {
      return {
        allPhotos: photos.filter(Boolean),
        photoCategories: [],
      };
    }

    const allPhotos = photos.flatMap((category) =>
      category.photos?.filter((photo) => photo.isVisible).map((photo) => photo.url) || []
    );
    const photoCategories = photos.map((category) => ({
      name: category.name,
      images: category.photos?.map((photo) => photo.url) || [],
    }));

    return { allPhotos, photoCategories };
  };

  const { allPhotos, photoCategories } = normalizePhotos(location.photos);

  // Extract minimum values from pricing
  const pricingData = location.pricing && location.pricing.length > 0 ? location.pricing[0] : null;
  // minim_hours: from day.min (minimum hours required for day booking)
  const minim_hours = pricingData?.day?.min || null;
  const minim_days = null; // Not currently in the pricing structure
  const minim_guests = pricingData?.guest?.min || null;
  const otherLocations = homepageLocations.filter((loc) => loc.id !== location.id);

  return (
    <div>
      <div className="bg-white rounded-lg mb-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">{location.name}</h1>

          <div className="flex items-center gap-4">
            {user &&
              <button
                onClick={handleToggleFavorite}
                className="flex items-center gap-1 px-3 py-1 rounded-full hover:bg-gray-100 transition text-sm text-gray-700 border border-gray-300"
                title={t('restaurant.add_to_favorites')}
                style={{ borderRadius: '50%', padding: '12px' }}
              >
                <Heart
                  size={20}
                  className={`${isFavorite ? 'fill-red-500 stroke-red-500' : 'stroke-gray-700'}`}
                />

              </button>
            }
            <button
              onClick={handleShare}
              className="flex items-center gap-1 px-3 py-1 rounded-full hover:bg-gray-100 transition text-sm text-gray-700 border border-gray-300"
              title={t('restaurant.share_location')}
              style={{ borderRadius: '50%', padding: '12px' }}
            >
              {copied ? (
                <>
                  <Check size={20} className="text-green-500" />
                </>
              ) : (
                <>
                  <Share size={20} className="stroke-gray-700" />
                </>
              )}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-gray-600 text-sm">
          <MapPin width={16} height={16} />
          <p>{location.address}</p>
          <span className="text-gray-400">|</span>
          <div className="flex items-center gap-1 text-accent">
            <Star size={16} className="fill-current stroke-none" />
            <span>{location.rating || '0'}</span>
            <span className="text-gray-400">({location.ratingCount || 0} {t('restaurant.reviews')})</span>
          </div>
          {location.googleMapsUrl && (
            <>
              <span className="text-gray-400">|</span>
              <a
                href={location.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                {t('restaurant.view_on_google_maps')}
              </a>
            </>

          )}
        </div>
      </div>

      <div className="mt-6">
        <ImageGallery
          name={location.name}
          categories={photoCategories.filter(category => category.images.length > 0)}
          images={allPhotos.filter(photo => photo !== null)}
        />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start mt-6">
          <div className="md:col-span-8">
            <LocationDetails location={location} />
          </div>

          <div className="md:col-span-4">
            <ReservationRight
              slug={slug}
              locationId={location.id}
              pricePerDay={60}
              guests={location.maxGuests || 4}
              startDate="2025-07-15"
              endDate="2025-07-18"
              pricing={location.pricing}
              pricingCategories={location.pricingCategories}
              categories={location.categories}
              minim_hours={minim_hours}
              minim_days={minim_days}
              minim_guests={minim_guests}
            />
          </div>
        </div>

        {otherLocations.length > 0 && (
          <div className="mt-4">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">{t('restaurant.similar_venues')}</h2>
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {otherLocations.map((loc) => (
                  <RestaurantCard
                    key={loc.id}
                    name={loc.name}
                    slug={loc.slug}
                    address={loc.address}
                    rating={parseFloat(loc.rating)}
                    ratingCount={loc.ratingCount}
                    maxGuests={loc.maxGuests}
                    photos={loc.photos}
                    locationId={loc.id}
                    viewFavorite={true}
                    pricing={loc.pricing}
                    pricingCategories={loc.pricingCategories}
                  />
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Restaurant
