import { ChevronRight, Lightbulb } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { LocationTip, SetupTab } from '../../../../config/locationQuality';

type LocationTipsProps = {
  tips: LocationTip[];
  getEditUrl: (tab: SetupTab) => string;
  limit?: number;
};

/** Sfaturile vin din regulile neîndeplinite din config/locationQuality.ts. */
const LocationTips = ({ tips, getEditUrl, limit = 4 }: LocationTipsProps) => {
  const navigate = useNavigate();
  const visibleTips = tips.slice(0, limit);

  return (
    <div className="bg-amber-50 rounded-xl border border-amber-200 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb className="w-5 h-5 text-amber-600 flex-shrink-0" aria-hidden />
        <h2 className="text-base font-semibold text-amber-700">Sfaturi pentru mai multe rezervări</h2>
      </div>

      {visibleTips.length === 0 ? (
        <p className="text-sm text-gray-600">
          Felicitări! Locația ta respectă toate recomandările noastre.
        </p>
      ) : (
        <div className="space-y-2">
          {visibleTips.map((tip) => (
            <button
              key={tip.id}
              onClick={() => navigate(getEditUrl(tip.step.tab))}
              className="w-full bg-white rounded-lg border border-[var(--color-gray)] p-3 flex items-center gap-3 text-left hover:border-amber-200 transition-colors"
            >
              <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                <tip.step.icon className="w-4 h-4 text-blue-700" aria-hidden />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-secondary">
                  {tip.label}
                  {tip.currentValue !== undefined && tip.target !== undefined && (
                    <span className="ml-1.5 text-xs font-medium text-gray-500">
                      ({tip.currentValue} / {tip.target})
                    </span>
                  )}
                </p>
                <p className="text-xs text-gray-500">{tip.hint}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" aria-hidden />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocationTips;
