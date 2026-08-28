import { AlertTriangle, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAdminStore } from '../../../../store/admin.store';

const getCompletionColor = (completion) => {
  if (completion >= 80) return 'var(--color-green)';
  if (completion >= 40) return 'var(--color-accent)';
  return 'var(--color-red)';
};

const IncompleteLocations = () => {
  const navigate = useNavigate();
  const { metrics } = useAdminStore();
  const locations = (metrics.locations || []).filter((location) => location.completion < 100);

  if (!locations.length) return null;

  const goToLocation = (location) =>
    navigate(`/partner/properties/edit/${location.id}-${location.slug}?tab=overview`);

  return (
    <div className="h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-accent flex-shrink-0" aria-hidden />
          <h2 className="text-lg font-semibold text-secondary">
            Completează toate detaliile la următoarele locații
          </h2>
        </div>
      </div>

      <div className="space-y-3">
        {locations.map((location) => (
          <div
            key={location.id}
            className="border border-[var(--color-gray)] rounded-lg px-4 py-3 flex items-center gap-4"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-secondary truncate">{location.name}</p>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex-1 h-1.5 rounded-full bg-[var(--color-gray)] overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${location.completion}%`,
                      backgroundColor: getCompletionColor(location.completion),
                    }}
                  />
                </div>
                <span
                  className="text-xs font-bold flex-shrink-0"
                  style={{ color: getCompletionColor(location.completion) }}
                >
                  {location.completion}%
                </span>
              </div>
            </div>
            <button
              onClick={() => goToLocation(location)}
              className="btn btn-outline flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm flex-shrink-0"
            >
              <span>Continuă</span>
              <ChevronRight className="w-3.5 h-3.5" aria-hidden />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export { IncompleteLocations };
