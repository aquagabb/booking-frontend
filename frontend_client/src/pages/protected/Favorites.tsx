import React from "react";
import RestaurantCard from "../../components/shared/RestaurantCard";
import { useFavorites } from "../../hooks/useFavorites";

type FavoriteLocation = {
  locationId?: number;
  id?: string | number;
  name: string;
  slug: string;
  address: string;
  rating: string | number;
  ratingCount: number;
  photos: string[];
};

type FavoritesProps = {
  viewHeader?: boolean;
};

const Favorites: React.FC<FavoritesProps> = ({ viewHeader = true }) => {
  const { favorites, syncing, syncFromBackend } = useFavorites({
    forceSyncOnMount: true,
  });

  const items = favorites as unknown as FavoriteLocation[];

  if (syncing && items.length === 0) {
    return null;
  }

  return (
    <div className={viewHeader ? 'px-6 py-8' : ''}>
      {viewHeader && <div className="flex items-center justify-between border-b pb-3 mb-6">
        <h3 className="flex items-center gap-2 font-bold text-2xl text-gray-700">
          <span>Favorites</span>
        </h3>
      </div>
      }
      {items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((location) => {
            const locationId = Number(location.locationId ?? location.id);
            const photos = location.photos ?? [];
            const rating =
              typeof location.rating === "number"
                ? location.rating
                : parseFloat(String(location.rating ?? "0"));

            return (
              <RestaurantCard
                key={locationId}
                photos={photos}
                name={location.name}
                slug={location.slug}
                address={location.address}
                rating={rating}
                ratingCount={location.ratingCount}
                maxGuests={50}
                locationId={locationId}
                viewFavorite={true}
                onToggleFavorite={() => {
                  void syncFromBackend();
                }}
              />
            );
          })}
        </div>
      ) : (
        <p className="text-gray-500 italic">You don't have any favorite locations yet.</p>
      )}
    </div>
  );
};

export default Favorites;
