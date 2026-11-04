import { useEffect, useState } from 'react';
import { ChevronRight, MapPin, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getLocations } from '../../../../api/locations/locations';
import { useAdminStore } from '../../../../store/admin.store';
import { getCompletionColor } from './AttentionNeeded';

const Locations = () => {
  const navigate = useNavigate();
  const { metrics } = useAdminStore();
  const [locations, setLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const { status, response } = await getLocations();
        if (status === 200) setLocations(response?.data || []);
      } catch (error) {
        console.error('Error fetching locations:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLocations();
  }, []);

  // Procentul de completare vine din metrics (dacă backend-ul îl trimite pentru locația respectivă)
  const getCompletion = (locationId) =>
    (metrics.locations || []).find((l) => String(l.id) === String(locationId))?.completion;

  const goToLocation = (location) =>
    navigate(`/partner/properties/edit/${location.id}-${location.slug}?tab=overview`);

  return (
    <div className="h-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-secondary">Locațiile tale</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/partner/properties')}
            className="text-sm text-primary hover:underline font-medium transition-colors"
          >
            Vezi toate
          </button>
          <button
            onClick={() => navigate('/partner/properties/onboarding')}
            className="btn-primary flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm"
          >
            <Plus className="w-3.5 h-3.5" aria-hidden />
            <span>Adaugă locație</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-sm text-gray-500">Se încarcă locațiile...</div>
      ) : locations.length === 0 ? (
        <div className="text-center py-12">
          <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Nu ai încă nicio locație</p>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,300px))] gap-4">
          {locations.map((location) => {
            const completion = getCompletion(location.id);
            const isIncomplete = typeof completion === 'number' && completion < 100;
            return (
              <div
                key={location.id}
                className="border border-[var(--color-gray)] rounded-lg bg-white overflow-hidden flex flex-col"
              >
                <div className="w-full h-32 bg-gray-100 overflow-hidden">
                  {location.firstImage ? (
                    <img src={location.firstImage} alt={location.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <MapPin className="w-10 h-10" aria-hidden />
                    </div>
                  )}
                </div>

                <div className="p-3 flex flex-col gap-2 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-secondary truncate">{location.name}</p>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${
                        location.isVisible ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {location.isVisible ? 'Activă' : 'Ascunsă'}
                    </span>
                  </div>

                  {location.address && (
                    <div className="flex items-start gap-1.5 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden />
                      <span className="line-clamp-2">{location.address}</span>
                    </div>
                  )}

                  {typeof completion === 'number' && (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-[var(--color-gray)] overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.min(completion, 100)}%`,
                            backgroundColor: getCompletionColor(completion),
                          }}
                        />
                      </div>
                      <span
                        className="text-xs font-bold flex-shrink-0"
                        style={{ color: getCompletionColor(completion) }}
                      >
                        {completion}%
                      </span>
                    </div>
                  )}

                  <button
                    onClick={() => goToLocation(location)}
                    className="btn-outline mt-auto flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-sm"
                  >
                    <span>{isIncomplete ? 'Completează detaliile' : 'Gestionează'}</span>
                    <ChevronRight className="w-3.5 h-3.5" aria-hidden />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Locations;
