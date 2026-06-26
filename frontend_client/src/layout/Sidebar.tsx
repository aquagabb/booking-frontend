import {
  LayoutDashboard,
  CalendarDays,
  ArrowUp,
  MessageSquareText,
  Settings,
  House,
  Calendar
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import { useUserStore } from '../store/user.store';
import { useAdminStore } from '../store/admin.store';
import { useEffect } from 'react';


const menuItems = [
  { label: 'Overview', icon: LayoutDashboard, to: '/partner/dashboard' },
  { label: 'Bookings', icon: CalendarDays, to: '/partner/bookings' },
  { label: "Messages", icon: MessageSquareText, to: '/partner/messages' },
  { label: 'Calendar', icon: Calendar, to: '/partner/calendar' },
  { label: 'Locations', icon: House, to: '/partner/properties' },

  // { label: 'Analytics', icon: BarChart2, to: '/partner/analytics' },
  // settings
  // { label: 'Settings', icon: Settings, to: '/partner/settings' },
  // { label: 'Support', icon: Support, to: '/partner/support' },
  // { label: 'Analytics', icon: BarChart2, to: '/dashboard/analytics' },
];

const Sidebar = () => {
  const { pathname } = useLocation();
  const { user, updatePreferences } = useUserStore();
  const { metrics, fetchMetrics } = useAdminStore();

  const sidebarState = user?.preferences?.sidebarState ?? 'open';
  const isOpen = sidebarState === 'open';

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  const unreadMessagesCount = metrics.unreadMessages;

  const toggleSidebar = () =>
    updatePreferences({
      sidebarState: isOpen ? 'collapsed' : 'open',
    });

  return (
    <div
      className={clsx(
        'h-full bg-white border-r shadow-md flex flex-col py-2 transition-all duration-300',
        isOpen ? 'w-60 px-4' : 'w-20 px-2'
      )}
    >
       
      <nav className="flex-1 space-y-2">
        {menuItems.map(({ label, icon: Icon, to }) => {
          const isActive = pathname.startsWith(to);
          const isMessages = to === '/partner/messages';
          const showBadge = isMessages && unreadMessagesCount > 0;

          return (
            <Link
              key={to}
              to={to}
              className={clsx(
                'flex items-center px-4 py-3 rounded-xl transition-all relative',
                isOpen ? 'gap-4' : 'justify-center',
                'text-base font-medium',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-gray-700 hover:bg-gray-100'
              )}
            >
              <Icon className="w-6 h-6" />
              {isOpen && (
                <span className="flex-1">{label}</span>
              )}
              {showBadge && (
                <span className={clsx(
                  'flex items-center justify-center rounded-full bg-primary text-white text-xs font-semibold',
                  isOpen ? 'min-w-[20px] h-5 px-1.5' : 'min-w-[18px] h-[18px] px-1 text-[10px]'
                )}>
                  {unreadMessagesCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Upgrade Section */}
      {isOpen && (
        <div className="mt-auto pt-4">
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 p-5 border border-orange-200/50">
            {/* Background Pattern/Decoration */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-2 right-2 w-16 h-16 rounded-full bg-orange-300 blur-xl"></div>
              <div className="absolute bottom-2 left-2 w-12 h-12 rounded-full bg-amber-300 blur-lg"></div>
            </div>
            
            {/* Content */}
            <div className="relative z-10">
              {/* Decorative Icon/Illustration */}
              <div className="mb-4 flex items-center justify-center">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-200 to-amber-200 flex items-center justify-center shadow-md">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-300 to-amber-300 flex items-center justify-center">
                      <CalendarDays className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                  {/* Floating elements */}
                  <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-400 shadow-sm"></div>
                  <div className="absolute -bottom-1 -left-1 w-2 h-2 rounded-full bg-purple-400 shadow-sm"></div>
                </div>
              </div>

              {/* Text */}
              <p className="text-sm font-medium text-gray-800 text-center mb-4 leading-relaxed">
                Manage all your venue
                <br />
                bookings in one place
                <br />
                with real-time updates.
              </p>

              {/* Upgrade Button */}
              <Link to="/partner/subscriptions" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg">
                <ArrowUp className="w-4 h-4" />
                <span>Upgrade now</span>
              </Link>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Sidebar;
