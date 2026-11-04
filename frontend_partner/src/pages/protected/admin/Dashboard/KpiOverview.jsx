import { CalendarDays, CircleCheck, Coins, Users } from 'lucide-react';
import { useAdminStore } from '../../../../store/admin.store';

const formatThousands = (value) => Math.round(value || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');

const formatCurrency = (value) => `${formatThousands(value)} RON`;

const KpiOverview = () => {
  const { metrics, isLoadingMetrics } = useAdminStore();

  const kpis = [
    { id: 'received', label: 'Rezervări primite', value: metrics.receivedBookings, icon: CalendarDays, tile: 'bg-blue-50 text-blue-700' },
    { id: 'confirmed', label: 'Rezervări confirmate', value: metrics.confirmedBookings, icon: CircleCheck, tile: 'bg-green-100 text-green-700' },
    { id: 'events', label: 'Evenimente luna aceasta', value: metrics.upcomingBookings, icon: Users, tile: 'bg-gray-100 text-primary' },
    { id: 'value', label: 'Valoarea rezervărilor', value: formatCurrency(metrics.confirmedbookingsPricetotal), icon: Coins, tile: 'bg-amber-50 text-amber-600' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi) => (
        <div
          key={kpi.id}
          className="border border-[var(--color-gray)] rounded-lg p-4 bg-white flex items-center gap-4"
        >
          <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${kpi.tile}`}>
            <kpi.icon className="w-6 h-6" aria-hidden />
          </div>
          <div className="min-w-0">
            <div className="text-2xl font-semibold text-secondary">
              {isLoadingMetrics ? '—' : kpi.value}
            </div>
            <span className="text-sm text-gray-500">{kpi.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default KpiOverview;
