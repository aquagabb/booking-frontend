import { useAdminStore } from '../../../../store/admin.store';

const formatThousands = (value) => Math.round(value || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');

const formatCurrency = (value) => `${formatThousands(value)} RON`;

const KpiOverview = () => {
  const { metrics, isLoadingMetrics } = useAdminStore();

  const kpis = [
    { id: 'events', label: 'Evenimente luna aceasta', value: metrics.upcomingBookings },
    { id: 'received', label: 'Rezervări primite', value: metrics.receivedBookings },
    { id: 'confirmed', label: 'Rezervări confirmate', value: metrics.confirmedBookings },
    { id: 'value', label: 'Valoarea rezervărilor', value: formatCurrency(metrics.confirmedbookingsPricetotal) },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi) => (
        <div
          key={kpi.id}
          className="border border-[var(--color-gray)] rounded-lg p-4 bg-white flex flex-col gap-2"
        >
          <span className="text-sm text-secondary">{kpi.label}</span>
          <div className="text-2xl font-semibold text-secondary">
            {isLoadingMetrics ? '—' : kpi.value}
          </div>
        </div>
      ))}
    </div>
  );
};

export default KpiOverview;
