import { useTranslation } from 'react-i18next';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/user.store';
import { useAdminStore } from '../store/admin.store';
import { useState, useEffect } from 'react';
import { Bell, Plus, Building2, Settings, User, LogOut, MessageSquare, CreditCard, ShieldCheck, HelpCircle, ChevronDown } from 'lucide-react';
import CustomModal from '../components/shared/Modals/CustomModal';
import { BookingFormBun } from '../pages/protected/admin/Forms/BookingFormBun';

const initialNotifications = [
  { id: 'n1', icon: '📅', title: 'Ai o rezervare nouă de la Maria Ionescu pentru 15 August', time: 'acum 5 minute', read: false },
  { id: 'n2', icon: '❌', title: 'Rezervarea #BK2451 a fost anulată de client', time: 'acum 20 de minute', read: false },
  { id: 'n3', icon: '💬', title: 'Mesaj nou de la Andrei Pop despre rezervarea #BK2448', time: 'acum 1 oră', read: false },
  { id: 'n4', icon: '💳', title: 'Plata pentru rezervarea #BK2440 a fost confirmată', time: 'acum 3 ore', read: true },
  { id: 'n5', icon: '⭐', title: 'Ai primit o recenzie nouă de 5 stele', time: 'acum 5 ore', read: true },
  { id: 'n6', icon: '🔄', title: 'Rezervare modificată: check-in mutat pe 22 August', time: 'ieri', read: true },
  { id: 'n7', icon: '⏰', title: 'Abonamentul tău expiră în 3 zile', time: 'acum 2 zile', read: false },
  { id: 'n8', icon: '⏳', title: 'Rezervarea #BK2430 așteaptă confirmare', time: 'acum 2 zile', read: false },
  { id: 'n9', icon: '🆕', title: 'Funcție nouă: export rezervări în format CSV', time: 'acum 4 zile', read: true },
  { id: 'n10', icon: '✅', title: 'Rezervarea #BK2410 a fost finalizată cu succes', time: 'acum 6 zile', read: true },
];

const NotificationsPanel = ({ open, notifications, onMarkRead, onViewAll, t }) => {
  if (!open) return null;

  return (
    <div className="absolute right-0 mt-2 w-96 bg-white border border-gray-200 rounded-xl z-50 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <span className="font-semibold text-sm text-secondary">{t('Notifications')}</span>
        <NavLink
          to="/partner/settings/notifications"
          className="p-2 rounded-md text-muted hover:text-secondary"
        >
          <Settings className="w-4 h-4" />
        </NavLink>
      </div>

      <div className="max-h-[380px] overflow-y-auto divide-y divide-gray-100">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => onMarkRead(notification.id)}
              className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors duration-200 hover:bg-gray-50 ${!notification.read ? 'bg-primary/5' : ''}`}
            >

              <div className="flex-1 min-w-0">
                <p className={`text-sm leading-snug line-clamp-2 ${!notification.read ? 'text-secondary font-medium' : 'text-muted'}`}>
                  {notification.title}
                </p>
                <p className="text-xs text-muted mt-1">{notification.time}</p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0 pt-1">
                {!notification.read && <span className="w-2 h-2 rounded-full bg-primary"></span>}
              </div>
            </div>
          ))
        ) : (
          <div className="px-4 py-6 text-sm text-muted text-center">
            {t('No notifications')}
          </div>
        )}
      </div>

      <div
        onClick={onViewAll}
        className="border-t border-gray-200 px-4 py-2.5 text-center text-sm text-primary hover:bg-gray-50 cursor-pointer transition-colors duration-200 hover:text-primary-dark"
      >
        {t('View all')}
      </div>
    </div>
  );
};

const OrganizationAvatar = ({ organization, size }) => {
  const dimension = size === 'lg' ? 'w-12 h-12' : 'w-8 h-8';
  const iconSize = size === 'lg' ? 'w-6 h-6' : 'w-4 h-4';
  const textSize = size === 'lg' ? 'text-sm' : 'text-xs';

  if (organization?.logo) {
    return (
      <img
        src={organization.logo}
        alt={organization.companyName}
        className={`${dimension} rounded-full object-cover border border-gray-200`}
      />
    );
  }

  return (
    <div className={`${dimension} flex items-center justify-center rounded-full bg-primary text-white font-semibold ${textSize} border border-gray-200`}>
      {organization?.companyName ? (
        organization.companyName
          .split(' ')
          .map((n) => n[0]?.toUpperCase())
          .join('')
          .slice(0, 2)
      ) : (
        <Building2 className={iconSize} />
      )}
    </div>
  );
};

const ProfileMenuLink = ({ to, icon: Icon, label, onClick }) => (
  <NavLink
    to={to}
    className="flex items-center gap-3 px-4 py-2.5 text-sm text-secondary hover:bg-gray-50 transition-all duration-200 group"
    onClick={onClick}
  >
    <Icon className="w-4 h-4 text-muted group-hover:text-primary transition-colors duration-200" />
    <span className="group-hover:text-secondary transition-colors duration-200">{label}</span>
  </NavLink>
);

const ProfilePanel = ({ open, organization, user, onClose, onLogout, t }) => {
  if (!open) return null;

  return (
    <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl overflow-hidden z-50">
      <div className="px-4 py-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <OrganizationAvatar organization={organization} size="lg" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-secondary truncate">
              {organization?.companyName || user?.name || t('My organization')}
            </p>
            {(organization?.email || user?.email) && (
              <p className="text-xs text-muted truncate mt-0.5">
                {organization?.email || user?.email}
              </p>
            )}

          </div>
        </div>
      </div>

      <div className="py-2">
        <ProfileMenuLink to="/profile" icon={User} label={t('Profile')} onClick={onClose} />
      </div>

      <div className="border-t border-gray-200"></div>

      <div className="py-2">
        <ProfileMenuLink to="/partner/settings/organization" icon={Settings} label={t('Account settings')} onClick={onClose} />
        <ProfileMenuLink to="/partner/settings/billing" icon={CreditCard} label={t('Subscription')} onClick={onClose} />
        <ProfileMenuLink to="/partner/settings/notifications" icon={Bell} label={t('Notifications')} onClick={onClose} />
        <ProfileMenuLink to="/partner/settings/security" icon={ShieldCheck} label={t('Security')} onClick={onClose} />
      </div>

      <div className="border-t border-gray-200"></div>

      <div className="py-2">
        <ProfileMenuLink to="/partner/settings/feedback" icon={MessageSquare} label={t('Feedback')} onClick={onClose} />
        <ProfileMenuLink to="/partner/settings/help" icon={HelpCircle} label={t('Ajutor')} onClick={onClose} />
      </div>

      <div className="border-t border-gray-200"></div>

      <div className="py-2">
        <button
          onClick={() => {
            onLogout();
            onClose();
          }}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-error hover:bg-gray-50 transition-all duration-200 group"
        >
          <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
          <span>{t('Log out')}</span>
        </button>
      </div>
    </div>
  );
};

const HeaderAdmin = () => {
  const { t } = useTranslation();
  const user = useUserStore((state) => state.user);
  const clearUser = useUserStore((state) => state.clearUser);
  const { organization, fetchOrganization } = useAdminStore();
  const navigate = useNavigate();

  const [openProfile, setOpenProfile] = useState(false);
  const [openNotifications, setOpenNotifications] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [isModalNewBooking, setIsModalNewBooking] = useState(false);

  useEffect(() => {
    if (!organization) {
      fetchOrganization();
    }
  }, [organization, fetchOrganization]);

  const handleLogout = () => {
    clearUser();
    navigate('/login');
  };

  const markNotificationAsRead = (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="bg-white sticky top-0 z-50 w-full border-b border-gray-200 max-h-16">
      <div className="mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link to="/partner/dashboard" className="flex items-center flex-shrink-0">
          <img src="/logo.png" alt="Logo" className="h-auto w-[140px] min-w-[120px]" />
        </Link>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={() => setIsModalNewBooking(true)}
            className="inline-flex items-center gap-1 px-2.5 h-8 bg-primary text-white rounded-md hover:bg-primary-dark transition-all duration-200 text-xs font-medium active:scale-[0.98]"
            title={t('Create Booking')}
          >
            <Plus className="w-4 h-4" />
            <span className="hidden lg:inline">{t('Create Booking')}</span>
          </button>

          <div className="relative">
            <button
              onClick={() => {
                setOpenNotifications(!openNotifications);
                setOpenProfile(false);
              }}
              className="relative p-1.5 rounded-md hover:bg-gray-100 transition-all duration-200 active:scale-95"
            >
              <Bell className="w-5 h-5 text-muted transition-colors duration-200 group-hover:text-secondary" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1 right-1 block w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-red)' }}></span>
              )}
            </button>

            <NotificationsPanel
              open={openNotifications}
              notifications={notifications}
              onMarkRead={markNotificationAsRead}
              onViewAll={() => {
                navigate('/partner/notifications');
                setOpenNotifications(false);
              }}
              t={t}
            />
          </div>

          <div className="relative">
            <button
              onClick={() => {
                setOpenProfile(!openProfile);
                setOpenNotifications(false);
              }}
              className="flex items-center gap-1.5 px-1.5 py-1 rounded-md hover:bg-gray-100 transition-all duration-200 active:scale-95"
            >
              <OrganizationAvatar organization={organization} />
              <ChevronDown className={`w-4 h-4 text-muted transition-transform flex-shrink-0 ${openProfile ? 'rotate-180' : ''}`} />
            </button>

            <ProfilePanel
              open={openProfile}
              organization={organization}
              user={user}
              onClose={() => setOpenProfile(false)}
              onLogout={handleLogout}
              t={t}
            />
          </div>
        </div>
      </div>

      <CustomModal
        open={isModalNewBooking}
        onClose={() => setIsModalNewBooking(false)}
        title={t('Create Booking')}
      >
        <BookingFormBun slug="new" />
      </CustomModal>
    </header>
  );
};

export default HeaderAdmin;
