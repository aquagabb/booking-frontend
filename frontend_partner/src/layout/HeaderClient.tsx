import { useTranslation } from 'react-i18next';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/user.store';
import { useFavoritesStore } from '../store/favorites.store';
import { useFavorites } from '../pages/protected/admin/Bookings/hooks/useFavorites';
import { useNotifications } from '../hooks/useNotifications';
import { useUnreadMessages } from '../hooks/useUnreadMessages';
import { useState } from 'react';
import { Bell, Heart, MessageSquareText } from 'lucide-react';
import Notifications from '../pages/protected/Notifications';

const HeaderClient = () => {
  const { t } = useTranslation();
  const user = useUserStore((state) => state.user);
  const clearUser = useUserStore((state) => state.clearUser);
  const navigate = useNavigate();

  useFavorites();
  useNotifications();
  useUnreadMessages();
  const favoritesCount = useFavoritesStore((state) => state.favorites.length);
  const unreadCount = useUserStore((state) => state.unreadCount);
  const unreadMessageCount = useUserStore((state) => state.unreadMessageCount);

  const [openProfile, setOpenProfile] = useState(false);
  const [openNotifications, setOpenNotifications] = useState(false);

  const formatBadge = (n: number) => (n > 99 ? '99+' : String(n));

  const handleLogout = () => {
    clearUser();
    navigate('/login');
  };

  const getInitials = (name: string) => {
    if (!name) return '';
    return name
      .split(' ')
      .map((n) => n[0]?.toUpperCase())
      .join('');
  };

  return (
    <div className="w-full border-b border-gray-200 bg-white sticky top-0 z-24">
      <header className="">
        <div className="mx-auto w-full md:py-4 md:px-8 py-2 px-4 flex items-center justify-between relative">
        <Link to="/" className="flex items-center flex-shrink-0">
                            <span className="text-lg font-bold">EventFinder</span>
                        {/* <img src="/logo_white.svg" alt="Logo" className="" style={{ height: '50px', width: '150px' }} /> */}
                    </Link>
          {/* <Link to="/" className="flex items-center flex-shrink-0">
            <img src="/logo.png" alt="Logo" className="h-7 w-auto" />
          </Link> */}

          <div className="flex items-center gap-4 relative">

        {user?.role === "owner" ? (
          <NavLink
            to="/partner/dashboard"
            className=''
          >
            {t('profile.partner_dashboard')}
          </NavLink>
        ) : (
          <NavLink
            to="/join"
            className=''
          >
            {t('profile.register_restaurant')}
          </NavLink>
        )}

          <div className="relative"> 
            <button
              onClick={() => navigate(`/account/favorites`)}
              className="relative p-2 rounded-full hover:bg-gray-100"
              aria-label={t('profile.favorites')}
            >
              <Heart className="w-6 h-6 text-gray-600" />
              {favoritesCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[1.125rem] h-5 px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-semibold leading-none">
                  {formatBadge(favoritesCount)}
                </span>
              )}
            </button>
            <button
              onClick={() => navigate(`/account/messages`)}
              className="relative p-2 rounded-full hover:bg-gray-100"
            >
              <MessageSquareText className="w-6 h-6 text-gray-600" />
              {unreadMessageCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[1.125rem] h-5 px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-semibold leading-none">
                  {formatBadge(unreadMessageCount)}
                </span>
              )}
            </button>
            <button
              onClick={() => {
                setOpenNotifications(!openNotifications);
                setOpenProfile(false);
              }}
              className="relative p-2 rounded-full hover:bg-gray-100"
            >
              <Bell className="w-6 h-6 text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[1.125rem] h-5 px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-semibold leading-none">
                  {formatBadge(unreadCount)}
                </span>
              )}
            </button>


            {openNotifications && (
              <div
                className="absolute right-0 mt-2 z-50 w-[min(28rem,calc(100vw-2rem))] max-h-[min(32rem,75vh)] overflow-y-auto overflow-x-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
              >
                <div className="p-3 sm:p-4">
                  <Notifications
                    embedded
                    onClose={() => setOpenNotifications(false)}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => {
                setOpenProfile(!openProfile);
                setOpenNotifications(false);
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100"
            >
              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-primary text-white font-semibold">
                {getInitials(user?.name)}
              </div>

              <span className="font-medium text-gray-700">{user?.name}</span>

              <svg
                className={`w-4 h-4 text-gray-500 transition-transform ${openProfile ? 'rotate-180' : ''
                  }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {openProfile && (
                <div className="absolute right-0 mt-2 w-64 bg-white border rounded-lg shadow-lg overflow-hidden z-50">
                <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-b">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-primary text-white font-semibold">
                      {getInitials(user?.name)}
                    </div>
                  )}

                  <div className="flex flex-col">
                    <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>

                  </div>
                </div>

                <div className="py-2">
                  <Link
                    to="/account/overview"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setOpenProfile(false)}
                  >
                    {t('Profile')}
                  </Link>
                  <Link
                    to="/account/bookings"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setOpenProfile(false)}
                  >
                    {t('Bookings')}
                  </Link>

                  <Link
                    to="/settings/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setOpenProfile(false)}
                  >
                    {t('Settings')}
                  </Link>
                  
                  {user?.role === "owner" ? (
                    <NavLink
                      to="/partner/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setOpenProfile(false)}
                    >
                      {t('profile.partner_dashboard')}
                    </NavLink>
                  ) : (
                    <NavLink
                      to="/join"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setOpenProfile(false)}
                    >
                      {t('profile.register_restaurant')}
                    </NavLink>
                  )}
                </div>

                <div className="border-t">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    {t('logout')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        </div>
      </header>

 
    </div>
  );
};

export default HeaderClient;
