import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Check, CircleCheck, Copy, ExternalLink, MapPin, Share2, Tag, Users, CalendarDays } from 'lucide-react';
import { copyToClipboard, getLocationPublicUrl, getPublicCalendarUrl, translateReferenceLabel } from '../../../../lib/utils';
import { formatPricingSummary, parsePricingData } from '../../../../utils/pricing';
import type { LocationQualityData, LocationTip, SetupTab } from '../../../../config/locationQuality';
import KpiOverview from './KpiOverview';
import LocationTips from './LocationTips';

type LocationLiveDashboardProps = {
  location: { id: number; slug: string; name: string; address?: string; firstImage?: string };
  isVisible: boolean;
  details: LocationQualityData;
  categoryOptions: Array<{ id: number | string; name: string }>;
  tips: LocationTip[];
  getEditUrl: (tab: SetupTab) => string;
};

/** Dashboard-ul afișat când locația are toți pașii obligatorii finalizați. Recomandările
 * rămase apar doar în cardul de sfaturi. */
const LocationLiveDashboard = ({
  location,
  isVisible,
  details,
  categoryOptions,
  tips,
  getEditUrl,
}: LocationLiveDashboardProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [copied, setCopied] = useState<'page' | 'calendar' | null>(null);
  const publicUrl = getLocationPublicUrl(location.slug);

  const calendarUrl = getPublicCalendarUrl(location.id);

  const handleCopy = async (key: 'page' | 'calendar') => {
    if (await copyToClipboard(key === 'page' ? publicUrl : calendarUrl)) {
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    }
  };

  const guests = (details.seatingPlans || []).filter((p) => !p.disabled && p.guests > 0).map((p) => p.guests);
  const minGuests = Math.min(...guests);
  const maxGuests = Math.max(...guests);
  const capacityLabel = guests.length === 0
    ? '-'
    : minGuests === maxGuests
      ? `până la ${maxGuests} pers.`
      : `${minGuests} - ${maxGuests} pers.`;

  const categoryNames = (details.categories || [])
    .map((id) => categoryOptions.find((c) => String(c.id) === String(id))?.name)
    .filter((name): name is string => Boolean(name))
    .map((name) => translateReferenceLabel(t, 'event_categories', name));
  const categoriesLabel = categoryNames.length === 0
    ? '-'
    : categoryNames.slice(0, 3).join(', ') + (categoryNames.length > 3 ? ` +${categoryNames.length - 3}` : '');

  const pricingValues = parsePricingData(details.pricing);
  const priceLabel = pricingValues.isPoa
    ? t('locations.price_on_application')
    : formatPricingSummary(pricingValues, { t });

  const infoItems = [
    { icon: Users, label: 'Capacitate', value: capacityLabel },
    { icon: CalendarDays, label: 'Tipuri de evenimente', value: categoriesLabel },
    { icon: Tag, label: 'Prețuri', value: priceLabel },
  ];

  return (
    <div className="space-y-6">
      {/* Banner: locație configurată */}
      <div className="bg-green-50 rounded-xl border border-[var(--color-gray)] px-6 py-5 flex flex-col lg:flex-row lg:items-center gap-6 overflow-hidden">
        <div className="flex items-start gap-4 flex-1">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
            <CircleCheck className="w-6 h-6 text-green-700" aria-hidden />
          </div>
          <div>
            <h1 className="text-xl font-bold text-secondary mb-1">
              {isVisible ? 'Locația ta este configurată și activă!' : 'Locația ta este configurată, dar nu e publică'}
            </h1>
            <p className="text-sm text-gray-600 mb-4">
              {isVisible
                ? 'Ești gata să primești solicitări de evenimente. Distribuie pagina locației și începe să atragi clienți.'
                : 'Ai completat toți pașii. Activează vizibilitatea ca organizatorii să o poată găsi și să-ți trimită solicitări.'}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              {isVisible ? (
                <a
                  href={publicUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-primary flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
                >
                  <span>Vezi pagina publică</span>
                  <ExternalLink className="w-4 h-4" aria-hidden />
                </a>
              ) : (
                <button
                  onClick={() => navigate(getEditUrl('details'))}
                  className="btn-primary flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
                >
                  Activează vizibilitatea
                </button>
              )}
              <button
                onClick={() => handleCopy('page')}
                className="btn-outline flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
              >
                <span>{copied === 'page' ? 'Link copiat' : 'Distribuie locația'}</span>
                {copied === 'page' ? <Check className="w-4 h-4" aria-hidden /> : <Share2 className="w-4 h-4" aria-hidden />}
              </button>
              <button
                onClick={() => handleCopy('calendar')}
                className="btn-outline flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
                title="Copiază linkul calendarului de disponibilitate, ca să-l trimiți clienților"
              >
                <span>{copied === 'calendar' ? 'Link copiat' : 'Distribuie calendarul'}</span>
                {copied === 'calendar' ? <Check className="w-4 h-4" aria-hidden /> : <CalendarDays className="w-4 h-4" aria-hidden />}
              </button>
            </div>
          </div>
        </div>

        {/* Previzualizare: fereastră de browser cu linkul locației */}
        <div className="hidden lg:flex items-center gap-4 flex-shrink-0">
          <div className="relative w-[200px] pt-4">
            <div className="bg-white rounded-lg border border-[var(--color-gray)] overflow-hidden">
              <div className="flex items-center gap-1 px-2 py-1.5 border-b border-[var(--color-gray)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-red)]" />
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                <span className="w-1.5 h-1.5 rounded-full bg-green" />
              </div>
              <div className="p-2">
                {location.firstImage ? (
                  <img src={location.firstImage} alt={location.name} className="w-full h-20 rounded object-cover" />
                ) : (
                  <div className="w-full h-20 rounded bg-gray-100 flex items-center justify-center text-gray-400">
                    <MapPin className="w-6 h-6" aria-hidden />
                  </div>
                )}
              </div>
            </div>
            {/* Linkul, suprapus peste colțul ferestrei */}
            <div className="absolute top-0 left-1/3 w-[280px] bg-white rounded-lg border border-[var(--color-gray)] px-3 py-1.5 flex items-center gap-2">
              <span className="flex-1 min-w-0 truncate text-xs text-gray-700">{publicUrl}</span>
              <button onClick={() => handleCopy('page')} className="text-green-700 flex-shrink-0" aria-label="Copiază linkul">
                {copied === 'page' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 pl-20 pt-8">
            <svg width="36" height="28" viewBox="0 0 36 28" fill="none" className="text-green-700 flex-shrink-0" aria-hidden>
              <path d="M34 22C24 26 10 22 4 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M2 11L4 5L9 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="text-sm italic font-medium text-green-700 leading-snug max-w-[150px] -rotate-6">
              Distribuie linkul și primește primele solicitări!
            </p>
          </div>
        </div>
      </div>

      <KpiOverview />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Locațiile tale */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[var(--color-gray)] p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-secondary">Locațiile tale</h2>
            <button
              onClick={() => navigate('/partner/properties')}
              className="text-sm text-primary hover:underline font-medium"
            >
              Vezi toate
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="w-full sm:w-56 h-36 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
              {location.firstImage ? (
                <img src={location.firstImage} alt={location.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <MapPin className="w-8 h-8" aria-hidden />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0 space-y-3">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-base font-semibold text-secondary truncate">{location.name}</p>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${
                      isVisible ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {isVisible ? 'Activă' : 'Ascunsă'}
                  </span>
                </div>
                {location.address && (
                  <div className="flex items-start gap-1.5 text-sm text-gray-600 mt-1">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden />
                    <span className="line-clamp-1">{location.address}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {infoItems.map((item) => (
                  <div key={item.label} className="flex items-start gap-2">
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                      <item.icon className="w-4 h-4 text-gray-600" aria-hidden />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">{item.label}</p>
                      <p className="text-sm font-semibold text-secondary">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => navigate(getEditUrl('details'))}
                  className="btn-outline px-3 py-1.5 rounded-lg text-sm"
                >
                  Gestionează locația
                </button>
              </div>
            </div>
          </div>
        </div>

        <LocationTips tips={tips} getEditUrl={getEditUrl} />
      </div>
    </div>
  );
};

export default LocationLiveDashboard;
