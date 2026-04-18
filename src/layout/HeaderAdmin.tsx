import { useTranslation } from 'react-i18next';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/user.store';
import { useAdminStore } from '../store/admin.store';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, Plus, Building2, Settings, Search, X, User, LogOut, Users, MessageSquare } from 'lucide-react';
import CustomModal from '../components/shared/Modals/CustomModal';
import { BookingFormBun } from '../pages/protected/admin/Forms/BookingFormBun';
import { getBookings } from '../api/bookings/bookings';
import { formatDate } from '../lib/utils';
import Onboarding from '../pages/protected/admin/Locations/Onboarding';

type BookingSuggestion = {
  id: string;
  code: string;
  slug: string;
  locationName: string;
  eventName: string;
  customerName: string;
  checkIn: string;
  checkOut: string;
  status: string;
};

const HeaderAdmin = () => {
  const { t } = useTranslation();
  const clearUser = useUserStore((state) => state.clearUser);
  const { organization } = useAdminStore();
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);




  const [openProfile, setOpenProfile] = useState(false);
  const [openNotifications, setOpenNotifications] = useState(false);
  const [isModalNewBooking, setIsModalNewBooking] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<BookingSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Debounced search function
  const debouncedSearch = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (term: string) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(async () => {
          if (term.trim().length >= 2) {
            setIsSearching(true);
            try {
              const { status, response } = await getBookings({
                term: term.trim(),
                pageSize: 5,
                pageNumber: 1,
              });
              if (status === 200 && response?.data) {
                setSearchSuggestions(response.data);
                setShowSuggestions(true);
              } else {
                setSearchSuggestions([]);
              }
            } catch (error) {
              console.error('Error searching bookings:', error);
              setSearchSuggestions([]);
            } finally {
              setIsSearching(false);
            }
          } else {
            setSearchSuggestions([]);
            setShowSuggestions(false);
          }
        }, 300);
      };
    })(),
    []
  );

  useEffect(() => {
    debouncedSearch(searchTerm);
  }, [searchTerm, debouncedSearch]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSuggestionClick = (booking: BookingSuggestion) => {
    navigate(`/partner/bookings/${booking.slug}`);
    setSearchTerm('');
    setShowSuggestions(false);
    inputRef.current?.blur();
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSearchSuggestions([]);
    setShowSuggestions(false);
  };

  const handleLogout = () => {
    clearUser();
    navigate('/login');
  };


  return (
    <header className="bg-white sticky top-0 z-50 w-full border-b border-gray-200 max-h-16">
      <div className="mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Left: Logo */}

        <Link to="/partner/dashboard" className="flex items-center flex-shrink-0">
                            <span className="text-lg font-bold">EventFinder</span>
          </Link>

        {/* Center: Search */}
        <div ref={searchRef} className="flex-1 max-w-2xl relative">
          <div className="relative flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                onFocus={() => searchTerm.length >= 2 && setShowSuggestions(true)}
                placeholder={t('Search bookings...') || 'Search bookings...'}
                className="w-full pl-9 pr-9 h-9 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm transition-all duration-200 hover:border-gray-400"
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200 rounded p-0.5 hover:bg-gray-100"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            
            {/* Create Booking Button - Right of Search */}
            <button
              onClick={() => setIsModalNewBooking(true)}
              className="inline-flex items-center gap-1.5 px-3 h-9 bg-primary text-white rounded-md hover:bg-[var(--color-primary-dark)] transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md active:scale-[0.98]"
              title={t('Create Booking')}
            >
              <Plus className="w-4 h-4" />
              <span className="hidden lg:inline">{t('Create Booking')}</span>
            </button>
          </div>

          {/* Search Suggestions Dropdown */}
          {showSuggestions && (searchSuggestions.length > 0 || isSearching) && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
              {isSearching ? (
                <div className="px-4 py-3 text-sm text-gray-500 text-center">
                  {t('Searching...') || 'Searching...'}
                </div>
              ) : searchSuggestions.length > 0 ? (
                <>
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase border-b">
                    {t('Bookings') || 'Bookings'}
                  </div>
                  {searchSuggestions.map((booking) => (
                    <button
                      key={booking.id}
                      onClick={() => handleSuggestionClick(booking)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-all duration-200 hover:shadow-sm active:scale-[0.99]"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm text-gray-900">{booking.code}</span>
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                              booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {booking.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 truncate">{booking.locationName}</p>
                          <p className="text-xs text-gray-500 truncate">{booking.customerName}</p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                            <span>{formatDate(booking.checkIn)}</span>
                            <span>→</span>
                            <span>{formatDate(booking.checkOut)}</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </>
              ) : (
                <div className="px-4 py-3 text-sm text-gray-500 text-center">
                  {t('No bookings found') || 'No bookings found'}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => {
                setOpenNotifications(!openNotifications);
                setOpenProfile(false);
              }}
              className="relative p-1.5 rounded-md hover:bg-gray-100 transition-all duration-200 active:scale-95"
            >
              <Bell className="w-5 h-5 text-gray-600 transition-colors duration-200 group-hover:text-gray-900" />
              <span className="absolute top-1 right-1 block w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {openNotifications && (
              <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="px-4 py-2.5 border-b border-gray-200 font-semibold text-sm text-gray-800">
                  {t('notifications')}
                </div>
                <div className="max-h-60 overflow-y-auto">
                  <div className="px-4 py-2 text-sm hover:bg-gray-50 cursor-pointer">
                    🔔 {t('New booking request')}
                  </div>
                  <div className="px-4 py-2 text-sm hover:bg-gray-50 cursor-pointer">
                    🎁 {t('You received a gift')}
                  </div>
                  <div className="px-4 py-2 text-sm hover:bg-gray-50 cursor-pointer">
                    💬 {t('New message from John')}
                  </div>
                </div>
                <div
                  onClick={() => {
                    navigate(`/partner/notifications`);
                    setOpenNotifications(false);
                  }}
                  className="border-t border-gray-200 px-4 py-2 text-center text-sm text-primary hover:bg-gray-50 cursor-pointer transition-colors duration-200 hover:text-primary-dark"
                >
                  {t('View all')}
                </div>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          {organization && (
            <div className="relative">
              <button
                onClick={() => {
                  setOpenProfile(!openProfile);
                  setOpenNotifications(false);
                }}
                className="flex items-center gap-1.5 px-1.5 py-1 rounded-md hover:bg-gray-100 transition-all duration-200 active:scale-95"
              >
                {organization.logo ? (
                  <img
                    src={organization.logo}
                    alt={organization.companyName}
                    className="w-7 h-7 rounded-full object-cover border border-gray-200"
                  />
                ) : (
                  <div className="w-7 h-7 flex items-center justify-center rounded-full bg-primary text-white font-semibold text-xs border border-gray-200">
                    {organization.companyName ? (
                      organization.companyName
                        .split(' ')
                        .map((n) => n[0]?.toUpperCase())
                        .join('')
                        .slice(0, 2)
                    ) : (
                      <Building2 className="w-3.5 h-3.5" />
                    )}
                  </div>
                )}
                <svg
                  className={`w-3.5 h-3.5 text-gray-500 transition-transform flex-shrink-0 ${openProfile ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown menu */}
              {openProfile && (
                <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden z-50">
                  {/* Header Section */}
                  <div className="px-4 py-4 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center gap-3">
                      {organization.logo ? (
                        <img
                          src={organization.logo}
                          alt={organization.companyName}
                          className="w-12 h-12 rounded-full object-cover border border-gray-200"
                        />
                      ) : (
                        <div className="w-12 h-12 flex items-center justify-center rounded-full bg-primary text-white font-semibold text-sm border border-gray-200">
                          {organization.companyName ? (
                            organization.companyName
                              .split(' ')
                              .map((n) => n[0]?.toUpperCase())
                              .join('')
                              .slice(0, 2)
                          ) : (
                            <Building2 className="w-6 h-6" />
                          )}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {organization.companyName}
                        </p>
                        {organization.email && (
                          <p className="text-xs text-gray-500 truncate mt-0.5">
                            {organization.email}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    <NavLink
                      to="/profile"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-all duration-200 group"
                      onClick={() => {
                        setOpenProfile(false);
                      }}
                    >
                      <User className="w-4 h-4 text-gray-500 group-hover:text-primary transition-colors duration-200" />
                      <span className="group-hover:text-gray-900 transition-colors duration-200">{t('Profile') || 'Profile'}</span>
                    </NavLink>
                    
                    <NavLink
                      to="/partner/settings"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-all duration-200 group"
                      onClick={() => {
                        setOpenProfile(false);
                      }}
                    >
                      <Settings className="w-4 h-4 text-gray-500 group-hover:text-primary transition-colors duration-200" />
                      <span className="group-hover:text-gray-900 transition-colors duration-200">{t('Account settings') || 'Account settings'}</span>
                    </NavLink>

                    <NavLink
                      to="/partner/settings/feedback"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-all duration-200 group"
                      onClick={() => {
                        setOpenProfile(false);
                      }}
                    >
                      <MessageSquare className="w-4 h-4 text-gray-500 group-hover:text-primary transition-colors duration-200" />
                      <span className="group-hover:text-gray-900 transition-colors duration-200">{t('Feedback') || 'Feedback'}</span>
                    </NavLink>
                  </div>

                  {/* Separator */}
                  <div className="border-t border-gray-200"></div>

                  {/* Bottom Menu Items */}
                  <div className="py-2">
                    <NavLink
                      to="/"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-all duration-200 group"
                      onClick={() => {
                        setOpenProfile(false);
                      }}
                    >
                      <Users className="w-4 h-4 text-gray-500 group-hover:text-primary transition-colors duration-200" />
                      <span className="group-hover:text-gray-900 transition-colors duration-200">{t('Switch account') || 'Switch account'}</span>
                    </NavLink>
                    
                    <button
                      onClick={() => {
                        handleLogout();
                        setOpenProfile(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-all duration-200 group hover:text-red-700"
                    >
                      <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                      <span>{t('Log out') || 'Log out'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <CustomModal
        open={isModalNewBooking}
        onClose={() => setIsModalNewBooking(false)}
        title={t('Create Booking')}
      >
        <BookingFormBun
          slug="new"
        />
      </CustomModal>
    </header>
  );
};

export default HeaderAdmin;
