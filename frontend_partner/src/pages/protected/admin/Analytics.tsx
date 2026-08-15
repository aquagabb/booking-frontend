import { useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Eye,
  ShoppingCart,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  Building2,
  Clock,
  Search,
  MapPin,
  Calendar,
} from 'lucide-react';
import clsx from 'clsx';

// ----------------------------
// EXISTING DATA
// ----------------------------

const eventCategoryData = [
  { name: 'Wedding', value: 1845, color: '#f97316' },
  { name: 'Corporate', value: 1234, color: '#3b82f6' },
  { name: 'Party', value: 987, color: '#eab308' },
  { name: 'Conference', value: 756, color: '#10b981' },
  { name: 'Other', value: 543, color: '#8b5cf6' },
];

const leadResponseTimeData = [
  { timeRange: '< 1 hour', count: 234, percentage: 45 },
  { timeRange: '1-4 hours', count: 156, percentage: 30 },
  { timeRange: '4-12 hours', count: 78, percentage: 15 },
  { timeRange: '12-24 hours', count: 39, percentage: 8 },
  { timeRange: '> 24 hours', count: 13, percentage: 2 },
];

const abandonedCheckoutsData = [
  { step: 'Date Selection', count: 203, percentage: 20 },
  { step: 'Guest Count', count: 152, percentage: 15 },
];

// ----------------------------
// SEARCH CATEGORIES DATA (Event Categories)
// Shows how many times user's locations appeared in searches for each category
// ----------------------------

const searchCategoriesData = [
  { category: 'Wedding', appearances: 1245, color: '#f97316' },
  { category: 'Corporate', appearances: 892, color: '#3b82f6' },
  { category: 'Party', appearances: 756, color: '#eab308' },
  { category: 'Conference', appearances: 634, color: '#10b981' },
  { category: 'Anniversary', appearances: 432, color: '#8b5cf6' },
  { category: 'Birthday', appearances: 321, color: '#ec4899' },
];

// ----------------------------
// LOCATION VIEWS DATA
// ----------------------------

const locationViewsData = [
  { name: 'Grand Palace Hotel', views: 2456, city: 'New York', bookings: 89 },
  { name: 'Mountain Retreat', views: 1892, city: 'Denver', bookings: 67 },
  { name: 'City Center Hall', views: 2567, city: 'Chicago', bookings: 124 },
  { name: 'Beachside Villa', views: 1743, city: 'Miami', bookings: 56 },
  { name: 'Downtown Loft', views: 1634, city: 'San Francisco', bookings: 78 },
];




const averageResponseTime = '2.3 hours';


// ----------------------------
// COMPONENT
// ----------------------------

const Analytics = () => {
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | '12m'>('30d');

  const totalViews = 5081;
  const totalBookings = 487;
  const totalInquiries = 2031;

  const viewsGrowth = 12.5;
  const bookingsGrowth = 8.3;
  const inquiriesGrowth = 15.2;

  const conversionRate = ((totalBookings / totalViews) * 100).toFixed(2);
  const inquiryToBookingRate = ((totalBookings / totalInquiries) * 100).toFixed(2);

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
            <p className="text-gray-600">Track your venue performance and insights</p>
          </div>
        </div>

        {/* Date Range Selector */}
        <div className="flex gap-2">
          {(['7d', '30d', '90d', '12m'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={clsx(
                'px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200',
                dateRange === range
                  ? 'bg-primary text-white shadow-lg shadow-primary/30'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-gray-300 shadow-sm'
              )}
            >
              {range === '7d'
                ? '7 Days'
                : range === '30d'
                ? '30 Days'
                : range === '90d'
                ? '90 Days'
                : '12 Months'}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <KpiCard
          label="Total Venue Views"
          value={totalViews}
          growth={viewsGrowth}
          icon={<Eye className="w-6 h-6 text-orange-600" />}
          bg="bg-orange-100"
        />

        <KpiCard
          label="Total Bookings"
          value={totalBookings}
          growth={bookingsGrowth}
          icon={<ShoppingCart className="w-6 h-6 text-blue-600" />}
          bg="bg-blue-100"
        />

        <KpiCard
          label="Total Inquiries"
          value={totalInquiries}
          growth={inquiriesGrowth}
          icon={<TrendingUp className="w-6 h-6 text-green-600" />}
          bg="bg-green-100"
        />
      </div>

      {/* Conversion Rates & Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Conversion Rates</h3>
          <div className="space-y-5">
            <Progress label="Views → Bookings" value={conversionRate} color="bg-primary" />
            <Progress label="Inquiries → Bookings" value={inquiryToBookingRate} color="bg-green-500" />
          </div>
        </div>

      </div>

      {/* Location Views */}
      <div className="mb-8">
        <Card title="Total Views by Location" icon={<MapPin className="w-5 h-5 text-gray-400" />}>
          <div className="space-y-4">
            {locationViewsData.map((location, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-5 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 hover:border-primary/30 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 mb-1">{location.name}</div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <MapPin className="w-4 h-4" />
                      <span>{location.city}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">{location.views.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">views</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-semibold text-primary">{location.bookings}</div>
                    <div className="text-xs text-gray-500">bookings</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Top Searched Categories */}
      <div className="mb-8">
        <Card title="Top Searched Categories (that matched your location)" icon={<Search className="w-5 h-5 text-gray-400" />}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {searchCategoriesData.map((item, index) => (
              <div
                key={index}
                className="group relative overflow-hidden p-6 bg-white rounded-xl border-2 border-gray-100 hover:border-primary/30 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center shadow-sm"
                      style={{ backgroundColor: `${item.color}15` }}
                    >
                      <Calendar className="w-5 h-5" style={{ color: item.color }} />
                    </div>
                    <span className="font-bold text-lg text-gray-900">{item.category}</span>
                  </div>
                </div>
                
                <div className="flex items-baseline gap-2 pt-4 border-t border-gray-100">
                  <div className="text-4xl font-bold" style={{ color: item.color }}>
                    {item.appearances.toLocaleString()}
                  </div>
                  <div className="text-sm font-medium text-gray-500 pt-2">
                    {item.appearances === 1 ? 'appearance' : 'appearances'}
                  </div>
                </div>
                
                <div className="mt-3 text-xs text-gray-400">
                  Your locations appeared in searches for "{item.category}"
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>


      {/* Abandoned Checkouts + Lead Response Time */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <Card title="Lead Response Time" icon={<Clock className="w-5 h-5 text-gray-400" />}>
          <div className="mb-5 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <p className="text-sm text-gray-600 mb-1">Average Response Time</p>
            <p className="text-2xl font-bold text-primary">{averageResponseTime}</p>
          </div>
          <div className="space-y-4">
            {leadResponseTimeData.map((item, index) => (
              <ProgressBar key={index} label={item.timeRange} percent={item.percentage} color="bg-blue-500" />
            ))}
          </div>
        </Card>
      </div>

    </div>
  );
};


// ----------------------------
// SMALL COMPONENTS
// ----------------------------

interface KpiCardProps {
  label: string;
  value: number;
  growth: number;
  icon: React.ReactNode;
  bg: string;
}

const KpiCard = ({ label, value, growth, icon, bg }: KpiCardProps) => (
  <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-200">
    <div className="flex items-center justify-between mb-5">
      <div className={`p-3 rounded-xl ${bg} shadow-sm`}>{icon}</div>

    </div>
    <h3 className="text-3xl font-bold text-gray-900 mb-1">{value.toLocaleString()}</h3>
    <p className="text-sm font-medium text-gray-600">{label}</p>
  </div>
);

interface CardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const Card = ({ title, icon, children }: CardProps) => (
  <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
    <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
      <h3 className="text-lg font-bold text-gray-900">{title}</h3>
      {icon}
    </div>
    {children}
  </div>
);

interface ProgressProps {
  label: string;
  value: string;
  color: string;
}

const Progress = ({ label, value, color }: ProgressProps) => (
  <div>
    <div className="flex justify-between mb-3">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <span className="text-sm font-bold text-gray-900">{value}%</span>
    </div>
    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
      <div 
        className={`${color} h-3 rounded-full transition-all duration-500 shadow-sm`} 
        style={{ width: `${value}%` }} 
      />
    </div>
  </div>
);

interface ProgressBarProps {
  label: string;
  percent: number;
  color: string;
}

const ProgressBar = ({ label, percent, color }: ProgressBarProps) => (
  <div>
    <div className="flex justify-between mb-2">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <span className="text-sm font-bold text-gray-900">{percent}%</span>
    </div>
    <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
      <div 
        className={`${color} h-3 rounded-full transition-all duration-500 shadow-sm`} 
        style={{ width: `${percent}%` }} 
      />
    </div>
  </div>
);

export default Analytics;
