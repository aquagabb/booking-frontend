import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Calendar,
  MessageSquare,
  AlertCircle,
  Clock,
  XCircle,
  CreditCard,
  Building2,
  AlertTriangle,
  Info,
  UserPlus,
  Filter,
} from 'lucide-react';
import { formatRelativeTime } from '../lib/utils';
import clsx from 'clsx';

type NotificationType =
  | 'booking'
  | 'message'
  | 'alert'
  | 'info'
  | 'reminder'
  | 'payment'
  | 'cancellation'
  | 'expiring'
  | 'system';

type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  date: string;
  isRead: boolean;
  priority?: 'high' | 'medium' | 'low';
  targetId?: string;
  locationName?: string;
  customerName?: string;
};

type FilterType = 'all' | 'unread' | NotificationType;

const NotificationsAdmin = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'booking',
      title: 'New Booking Received',
      message: 'You received a new booking request for "Grand Ballroom" from John Smith',
      date: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
      isRead: false,
      priority: 'high',
      targetId: '101',
      locationName: 'Grand Ballroom',
      customerName: 'John Smith',
    },
    {
      id: '2',
      type: 'message',
      title: 'New Message',
      message: 'You received a new message from Sarah Johnson regarding booking #BK-2024-045',
      date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      isRead: false,
      priority: 'medium',
      targetId: '55',
      customerName: 'Sarah Johnson',
    },
    {
      id: '3',
      type: 'expiring',
      title: 'Expiring Pending Confirmation',
      message: '3 pending booking confirmations are expiring in the next 24 hours. Please review them soon.',
      date: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
      isRead: false,
      priority: 'high',
      targetId: 'manage',
    },
    {
      id: '4',
      type: 'reminder',
      title: 'Event Reminder',
      message: 'The event "Corporate Dinner" at "Riverside Restaurant" starts in 10 days',
      date: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
      isRead: false,
      priority: 'medium',
      targetId: '201',
      locationName: 'Riverside Restaurant',
    },
    {
      id: '5',
      type: 'payment',
      title: 'Payment Confirmed',
      message: 'Payment of €450.00 has been confirmed for booking #BK-2024-042',
      date: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
      isRead: true,
      priority: 'low',
      targetId: '102',
    },
    {
      id: '6',
      type: 'alert',
      title: 'System Alert',
      message: 'Your subscription will expire in 7 days. Please renew to continue using all features.',
      date: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
      isRead: false,
      priority: 'high',
    },
    {
      id: '7',
      type: 'reminder',
      title: 'Event Reminder',
      message: 'The event "Wedding Reception" at "Garden Venue" starts tomorrow at 6:00 PM',
      date: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
      isRead: false,
      priority: 'high',
      targetId: '203',
      locationName: 'Garden Venue',
    },
    {
      id: '8',
      type: 'booking',
      title: 'New Booking Received',
      message: 'You received a new booking request for "City Center Hall" from Michael Brown',
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      isRead: true,
      priority: 'medium',
      targetId: '103',
      locationName: 'City Center Hall',
      customerName: 'Michael Brown',
    },
    {
      id: '9',
      type: 'cancellation',
      title: 'Booking Cancelled',
      message: 'Booking #BK-2024-038 has been cancelled by the customer. Refund processed.',
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 - 2 * 60 * 60 * 1000).toISOString(), // 1 day 2 hours ago
      isRead: true,
      priority: 'medium',
      targetId: '104',
    },
    {
      id: '10',
      type: 'info',
      title: 'Location Updated',
      message: 'Your location "Beachside Restaurant" has been successfully updated with new photos',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      isRead: true,
      priority: 'low',
      locationName: 'Beachside Restaurant',
    },
    {
      id: '11',
      type: 'message',
      title: 'New Message',
      message: 'You received a new message from Emma Wilson about special dietary requirements',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      isRead: true,
      priority: 'medium',
      targetId: '56',
      customerName: 'Emma Wilson',
    },
    {
      id: '12',
      type: 'reminder',
      title: 'Event Reminder',
      message: 'The event "Birthday Party" at "Sky Lounge" starts in 5 days',
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
      isRead: true,
      priority: 'medium',
      targetId: '205',
      locationName: 'Sky Lounge',
    },
    {
      id: '13',
      type: 'expiring',
      title: 'Expiring Hold',
      message: 'A booking hold for "Mountain View Restaurant" is expiring in 12 hours',
      date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
      isRead: true,
      priority: 'high',
      locationName: 'Mountain View Restaurant',
    },
    {
      id: '14',
      type: 'system',
      title: 'System Update',
      message: 'New features have been added to your dashboard. Check out the latest updates!',
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
      isRead: true,
      priority: 'low',
    },
    {
      id: '15',
      type: 'booking',
      title: 'New Booking Received',
      message: 'You received a new booking request for "Luxury Banquet Hall" from David Lee',
      date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), // 6 days ago
      isRead: true,
      priority: 'medium',
      targetId: '105',
      locationName: 'Luxury Banquet Hall',
      customerName: 'David Lee',
    },
  ]);

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'booking':
        return Calendar;
      case 'message':
        return MessageSquare;
      case 'alert':
        return AlertTriangle;
      case 'info':
        return Info;
      case 'reminder':
        return Clock;
      case 'payment':
        return CreditCard;
      case 'cancellation':
        return XCircle;
      case 'expiring':
        return AlertCircle;
      case 'system':
        return Bell;
      default:
        return Bell;
    }
  };

  const getNotificationColor = (type: NotificationType) => {
    switch (type) {
      case 'booking':
        return 'text-blue-600';
      case 'message':
        return 'text-blue-600';
      case 'alert':
        return 'text-red-600';
      case 'info':
        return 'text-gray-600';
      case 'reminder':
        return 'text-amber-600';
      case 'payment':
        return 'text-green-600';
      case 'cancellation':
        return 'text-red-600';
      case 'expiring':
        return 'text-orange-600';
      case 'system':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    setNotifications((prev) =>
      prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
    );

    // Navigate based on type
    if (notification.type === 'message' && notification.targetId) {
      navigate(`/partner/messages/${notification.targetId}`);
    } else if (notification.type === 'booking' && notification.targetId) {
      navigate(`/partner/bookings/${notification.targetId}`);
    } else if (notification.type === 'expiring' && notification.targetId === 'manage') {
      navigate('/partner/bookings/manage');
    } else if (notification.targetId) {
      navigate(`/partner/bookings/${notification.targetId}`);
    }
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const filteredNotifications = useMemo(() => {
    if (activeFilter === 'all') {
      return notifications;
    }
    if (activeFilter === 'unread') {
      return notifications.filter((n) => !n.isRead);
    }
    return notifications.filter((n) => n.type === activeFilter);
  }, [notifications, activeFilter]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  
  const filterTabs: { key: FilterType; label: string; count?: number }[] = [
    { key: 'all', label: 'All', count: notifications.length },
    { key: 'unread', label: 'Unread', count: unreadCount },
    { key: 'booking', label: 'Bookings' },
    { key: 'message', label: 'Messages' },
    { key: 'reminder', label: 'Reminders' },
    { key: 'payment', label: 'Payments' },
    { key: 'alert', label: 'Alerts' },
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Notifications</h1>
              <p className="text-sm text-gray-500 mt-1">
                {unreadCount > 0 ? (
                  <>
                    {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                  </>
                ) : (
                  'All caught up!'
                )}
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center gap-1 p-2 border-b border-gray-100">
              <Filter className="w-4 h-4 text-gray-400 mr-2" />
              <div className="flex gap-1 overflow-x-auto">
                {filterTabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveFilter(tab.key)}
                    className={clsx(
                      'relative px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors rounded-md',
                      activeFilter === tab.key
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    )}
                  >
                    {tab.label}
                    {tab.count !== undefined && tab.count > 0 && (
                      <span
                        className={clsx(
                          'ml-2 px-1.5 py-0.5 rounded-full text-xs font-medium',
                          activeFilter === tab.key
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-600'
                        )}
                      >
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        {filteredNotifications.length > 0 ? (
          <div className="space-y-2">
            {filteredNotifications.map((notification) => {
              const Icon = getNotificationIcon(notification.type);
              const iconColor = getNotificationColor(notification.type);
              const time = formatRelativeTime(notification.date);

              return (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={clsx(
                    'bg-white border rounded-lg shadow-sm cursor-pointer transition-all hover:shadow-md',
                    !notification.isRead && 'border-blue-200 bg-blue-50/30'
                  )}
                >
                  <div className="p-5">
                    <div className="flex items-start gap-4">
                      {/* Unread Indicator */}
                      {!notification.isRead && (
                        <div className="mt-1.5 flex-shrink-0">
                          <div className="w-2 h-2 rounded-full bg-blue-600" />
                        </div>
                      )}

                      {/* Icon */}
                      <div
                        className={clsx(
                          'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-gray-50',
                          iconColor
                        )}
                      >
                        <Icon className="w-5 h-5" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-1.5">
                          <h3
                            className={clsx(
                              'font-semibold text-base',
                              !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                            )}
                          >
                            {notification.title}
                          </h3>
                          <span className="text-xs text-gray-400 flex-shrink-0" title={time.full}>
                            {time.relative}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                          {notification.message}
                        </p>

                        {/* Additional Info */}
                        {(notification.locationName || notification.customerName) && (
                          <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                            {notification.locationName && (
                              <div className="flex items-center gap-1.5">
                                <Building2 className="w-3.5 h-3.5" />
                                <span>{notification.locationName}</span>
                              </div>
                            )}
                            {notification.customerName && (
                              <div className="flex items-center gap-1.5">
                                <UserPlus className="w-3.5 h-3.5" />
                                <span>{notification.customerName}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Priority Badge */}
                        {notification.priority === 'high' && (
                          <div className="mt-2">
                            <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded bg-red-50 text-red-700">
                              <AlertCircle className="w-3 h-3" />
                              High Priority
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="text-center py-16">
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg font-medium mb-1">
                {activeFilter === 'unread'
                  ? 'No unread notifications'
                  : activeFilter !== 'all'
                    ? `No ${activeFilter} notifications`
                    : 'No notifications'}
              </p>
              <p className="text-gray-400 text-sm">
                {activeFilter !== 'all' && (
                  <button
                    onClick={() => setActiveFilter('all')}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View all notifications
                  </button>
                )}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsAdmin;