import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Check, ChevronRight, Copy, Lightbulb, MapPin, Send, X } from 'lucide-react';
import {
  getAvailabilityRules,
  getLocationById,
  getLocationPhotos,
  getLocations,
} from '../../../../api/locations/locations';
import { getGeneralData } from '../../../../api/others/others';
import { useAdminStore } from '../../../../store/admin.store';
import { copyToClipboard, getLocationPublicUrl, getPublicCalendarUrl } from '../../../../lib/utils';
import {
  evaluateLocationQuality,
  type LocationQualityData,
  type LocationQualityResult,
  type SetupTab,
} from '../../../../config/locationQuality';
import KpiOverview from './KpiOverview';
import Locations from './Locations';
import LocationTips from './LocationTips';
import LocationLiveDashboard from './LocationLiveDashboard';

const HERO_TIP_KEY = 'dashboard_setup_hero_tip_dismissed';

type ListLocation = {
  id: number;
  slug: string;
  name: string;
  address?: string;
  firstImage?: string;
  isVisible?: boolean;
};

const readFlag = (key: string) => {
  try {
    return localStorage.getItem(key) === '1';
  } catch {
    return false;
  }
};

const writeFlag = (key: string) => {
  try {
    localStorage.setItem(key, '1');
  } catch {
    // ignorăm — sfatul va reapărea la următoarea vizită
  }
};

const LocationSetupDashboard = () => {
  const navigate = useNavigate();
  const { metrics } = useAdminStore();
  const stepsRef = useRef<HTMLDivElement>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [locationsCount, setLocationsCount] = useState(0);
  const [location, setLocation] = useState<ListLocation | null>(null);
  const [details, setDetails] = useState<LocationQualityData>({});
  const [categoryOptions, setCategoryOptions] = useState<Array<{ id: number | string; name: string }>>([]);
  const [quality, setQuality] = useState<LocationQualityResult | null>(null);
  const [copied, setCopied] = useState<'page' | 'calendar' | null>(null);
  const [isHeroTipVisible, setIsHeroTipVisible] = useState(() => !readFlag(HERO_TIP_KEY));

  useEffect(() => {
    const load = async () => {
      try {
        const { status, response } = await getLocations();
        const list: ListLocation[] = status === 200 ? response?.data || [] : [];
        setLocationsCount(list.length);
        if (list.length === 0) return;

        // Prima locație încă incompletă (după metrics), altfel cea mai recentă
        const incompleteIds = (metrics.locations || [])
          .filter((l) => l.completion < 100)
          .map((l) => String(l.id));
        const target = list.find((l) => incompleteIds.includes(String(l.id))) || list[list.length - 1];

        const [locationResult, availabilityResult, photosResult, generalResult] = await Promise.all([
          getLocationById(target.id),
          getAvailabilityRules(target.id),
          getLocationPhotos(target.id),
          getGeneralData(),
        ]);

        const loc: LocationQualityData =
          locationResult?.environment?.status === 200 ? locationResult.response?.data || {} : {};
        const availabilityItems: Array<{ type?: string }> =
          availabilityResult?.environment?.status === 200 ? availabilityResult.response?.data || [] : [];
        const photoCategories: Array<{ photos?: unknown[] }> =
          photosResult?.status === 200 && Array.isArray(photosResult.response) ? photosResult.response : [];
        const photosCount = photoCategories.reduce((sum, c) => sum + (c.photos?.length || 0), 0);

        setLocation({ ...target, isVisible: loc.isVisible ?? target.isVisible });
        setDetails(loc);
        setCategoryOptions(generalResult?.environment?.status === 200 ? generalResult.response?.data?.categories || [] : []);
        setQuality(
          evaluateLocationQuality({
            location: loc,
            // Fallback pe `firstImage` dacă endpoint-ul de poze nu răspunde
            photosCount: photosCount || (target.firstImage ? 1 : 0),
            hasAvailability: availabilityItems.some((item) => item.type !== 'block'),
          })
        );
      } catch (error) {
        console.error('Error loading location setup:', error);
      } finally {
        setIsLoading(false);
      }
    };
    load();
    // Rulează o singură dată — metrics e folosit doar pentru alegerea locației
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <KpiOverview />
        <div className="text-center py-12 text-sm text-gray-500">Se încarcă...</div>
      </div>
    );
  }

  if (!location || !quality) {
    return (
      <div className="space-y-6">
        <KpiOverview />
        <Locations />
      </div>
    );
  }

  const getEditUrl = (tab: SetupTab) => `/partner/properties/edit/${location.id}-${location.slug}?tab=${tab}`;
  const otherLocations = locationsCount > 1 && <Locations />;

  // Toți pașii obligatorii gata → banner-ul "configurată"; recomandările rămân ca sfaturi
  if (quality.isComplete) {
    return (
      <div className="space-y-6">
        <LocationLiveDashboard
          location={location}
          isVisible={Boolean(location.isVisible)}
          details={details}
          categoryOptions={categoryOptions}
          tips={quality.tips}
          getEditUrl={getEditUrl}
        />
        {otherLocations}
      </div>
    );
  }

  const { steps, doneCount } = quality;
  const progress = Math.round((doneCount / steps.length) * 100);
  const nextStep = steps.find((s) => !s.done);
  const publicUrl = getLocationPublicUrl(location.slug);
  const calendarUrl = getPublicCalendarUrl(location.id);
  // Calendarul are sens doar după ce locația are un program de disponibilitate
  const hasAvailability = steps.find((s) => s.tab === 'rules')?.done ?? false;

  const handleCopy = async (key: 'page' | 'calendar') => {
    if (await copyToClipboard(key === 'page' ? publicUrl : calendarUrl)) {
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    }
  };

  const shareLinks = [
    { key: 'page' as const, label: 'Pagina locației', url: publicUrl, enabled: true },
    { key: 'calendar' as const, label: 'Calendarul de disponibilitate', url: calendarUrl, enabled: hasAvailability },
  ];

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="bg-blue-50 rounded-xl border border-[var(--color-gray)] p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-700 mb-2">Configurare locație</p>
          <h1 className="text-2xl font-bold text-secondary mb-2">
            Hai să pregătim locația pentru prima rezervare!
          </h1>
          <p className="text-sm text-gray-600 mb-6">
            Completează câțiva pași simpli pentru ca organizatorii să te poată descoperi, iar tu să primești solicitări de evenimente.
          </p>

          <p className="text-sm font-medium text-gray-700 mb-2">
            {doneCount} din {steps.length} pași finalizați
          </p>
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-2 rounded-full bg-[var(--color-gray)] overflow-hidden">
              <div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-sm text-gray-600 flex-shrink-0">{progress}%</span>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => navigate(getEditUrl(nextStep?.tab || 'details'))}
              className="btn-primary flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
            >
              <span>Continuă configurarea locației</span>
              <ArrowRight className="w-4 h-4" aria-hidden />
            </button>
            <button
              onClick={() => stepsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className="text-sm text-primary hover:underline font-medium"
            >
              Vezi pașii necesari
            </button>
          </div>
        </div>

        {location.firstImage && (
          <div className="relative h-56 rounded-xl overflow-hidden">
            <img src={location.firstImage} alt={location.name} className="w-full h-full object-cover" />
            {isHeroTipVisible && (
              <div className="absolute top-3 right-3 max-w-[240px] bg-white rounded-lg border border-[var(--color-gray)] p-3 flex items-start gap-2">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                  <Lightbulb className="w-4 h-4 text-amber-600" aria-hidden />
                </div>
                <p className="text-xs text-gray-700 flex-1">
                  O locație completă și activă primește cu până la 3x mai multe solicitări.
                </p>
                <button
                  onClick={() => {
                    writeFlag(HERO_TIP_KEY);
                    setIsHeroTipVisible(false);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Închide"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <KpiOverview />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Pașii de configurare + ce lipsește la fiecare */}
        <div ref={stepsRef} className="bg-white rounded-xl border border-[var(--color-gray)] p-4 scroll-mt-20">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-secondary">Următorii pași pentru activare</h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
              {steps.length} pași
            </span>
          </div>

          <div className="divide-y divide-[var(--color-gray)]">
            {steps.map((step) => {
              const hasRecommendations = step.missingRecommended.length > 0;
              return (
                <div key={step.key} className="flex items-start gap-3 py-3">
                  <div
                    className={`flex-shrink-0 mt-0.5 w-6 h-6 rounded-full flex items-center justify-center ${
                      step.done ? 'bg-green-600 text-white' : 'border-2 border-[var(--color-gray)]'
                    }`}
                  >
                    {step.done && <Check className="w-3.5 h-3.5" aria-hidden />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-secondary">{step.title}</p>
                      {step.done && hasRecommendations && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                          {step.missingRecommended.length}{' '}
                          {step.missingRecommended.length === 1 ? 'recomandare' : 'recomandări'}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{step.description}</p>

                    {(step.missingRequired.length > 0 || hasRecommendations) && (
                      <ul className="mt-2 space-y-1">
                        {step.missingRequired.map((rule) => (
                          <li key={rule.id} className="text-xs text-red-600 flex items-start gap-1.5">
                            <span aria-hidden>•</span>
                            <span>{rule.label}</span>
                          </li>
                        ))}
                        {step.missingRecommended.map((rule) => (
                          <li key={rule.id} className="text-xs text-amber-700 flex items-start gap-1.5">
                            <span aria-hidden>•</span>
                            <span>
                              {rule.label}
                              {rule.currentValue !== undefined && rule.target !== undefined && (
                                <span className="text-gray-500"> ({rule.currentValue} / {rule.target})</span>
                              )}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {step.done && !hasRecommendations ? (
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0" aria-hidden />
                  ) : (
                    <button
                      onClick={() => navigate(getEditUrl(step.tab))}
                      className="btn-outline px-3 py-1.5 rounded-lg text-sm flex-shrink-0 min-w-[110px]"
                    >
                      {step.done ? 'Îmbunătățește' : step.actionLabel}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
          {/* Locația curentă */}
          <div className="bg-white rounded-xl border border-[var(--color-gray)] p-4">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-accent" aria-hidden />
                <h2 className="text-base font-semibold text-secondary">Locația ta este în curs de configurare</h2>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${
                  location.isVisible ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {location.isVisible ? 'Activă' : 'Ascunsă'}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-36 h-24 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                {location.firstImage ? (
                  <img src={location.firstImage} alt={location.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <MapPin className="w-8 h-8" aria-hidden />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0 space-y-2">
                <p className="text-sm font-semibold text-secondary truncate">{location.name}</p>
                {location.address && (
                  <div className="flex items-start gap-1.5 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden />
                    <span className="line-clamp-2">{location.address}</span>
                  </div>
                )}
                <button
                  onClick={() => navigate(getEditUrl('details'))}
                  className="btn-outline flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm"
                >
                  <span>Gestionează locația</span>
                  <ChevronRight className="w-3.5 h-3.5" aria-hidden />
                </button>
              </div>
            </div>
          </div>

          {/* Distribuire link */}
          <div className="bg-white rounded-xl border border-[var(--color-gray)] p-4 flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Send className="w-5 h-5 text-blue-700" aria-hidden />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-secondary">Distribuie locația și primește solicitări</p>
              <p className="text-xs text-gray-500 mb-3">
                După ce publici locația, poți distribui către clienți pagina locației și calendarul de disponibilitate.
              </p>
              <div className="space-y-3">
                {shareLinks.map((link) => (
                  <div key={link.key}>
                    <p className="text-xs font-medium text-gray-700 mb-1">{link.label}</p>
                    {link.enabled ? (
                      <div className="flex items-center gap-2">
                        <input
                          readOnly
                          value={link.url}
                          onFocus={(e) => e.target.select()}
                          className="flex-1 min-w-0 px-3 py-1.5 rounded-lg border border-[var(--color-gray)] text-sm text-gray-700 bg-white"
                        />
                        <button
                          onClick={() => handleCopy(link.key)}
                          className="btn-outline flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm flex-shrink-0"
                        >
                          {copied === link.key ? <Check className="w-3.5 h-3.5" aria-hidden /> : <Copy className="w-3.5 h-3.5" aria-hidden />}
                          <span>{copied === link.key ? 'Copiat' : 'Copiază'}</span>
                        </button>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500">Disponibil după ce setezi programul locației.</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <LocationTips tips={quality.tips} getEditUrl={getEditUrl} />
        </div>
      </div>

      {otherLocations}
    </div>
  );
};

export default LocationSetupDashboard;
