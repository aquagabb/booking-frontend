
import Login from '../pages/Login';
import Register from '../pages/Register';
import Restaurants from '../pages/Restaurants';
import Restaurant from '../pages/Restaurant';
import CheckoutContainer from '../pages/CheckoutContainer';
import CheckoutSuccess from '../pages/CheckoutSuccess';

import Profile from '../pages/protected/Profile';


import Home from '../pages/Home';
import type { ReactElement } from 'react';
import Dashboard from '../pages/protected/admin/Dashboard';
import PropertiesList from '../pages/protected/admin/Forms/Tables/PropertiesList';

import LocationPage from '../pages/protected/admin/LocationPage';
import PartnerPage from '../pages/PartnerPage';

import BookingPage from '../pages/protected/admin/BookingPage';
import Favorites from '../pages/protected/Favorites';
import Notifications from '../pages/protected/Notifications';
import Settings from '../pages/protected/Settings';
import SettingsAdmin from '../pages/protected/admin/Settings';
import Subscriptions from '../pages/Subscriptions';
import GoogleCallback from '../pages/GoogleCallback';
import Messages from '../pages/protected/admin/Messages';
import Analytics from '../pages/protected/admin/Analytics';
import BookingsPage from '../pages/protected/admin/Bookings/BookingsPage';
import AccountTabsPage from '../pages/protected/AccountTabs';
import ReservationClient from '../pages/protected/client/Reservations/ReservationClient';
import MessagesAdmin from '../pages/protected/MessagesAdmin';
import PendingBookings from '../pages/protected/admin/PendingBookings';
import PartnerRegister from '../pages/PartnerRegister';
import PartnerBecomePage from '../pages/PartnerBecomePage';
import Calendar from '../pages/protected/admin/Calendar';
import NotificationsAdmin from '../pages/NotificationsAdmin';
import LocationsPage from '../pages/protected/admin/LocationsPages';

export type AppRoute = {
  path: string;
  element: ReactElement;
};

export const publicRoutes: AppRoute[] = [
  { path: '/', element: <Home /> },
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  // for forgot password
  
  { path: '/join', element: <PartnerPage /> },
  { path: '/join/register', element: <PartnerBecomePage /> },
  { path: '/restaurants', element: <Restaurants /> },
  { path: '/restaurants/:slug', element: <Restaurant /> },
  { path: '/checkout/:slug', element: <CheckoutContainer /> },
  { path: '/checkout/successful/:id/:code', element: <CheckoutSuccess /> },
  // { path: '/subscriptions', element: <Subscriptions /> },
  { path: '/auth/google/callback', element: <GoogleCallback /> },

  { path: '/terms', element: <Subscriptions /> },
  { path: '/privacy', element: <Subscriptions /> },
  { path: '/contact', element: <Subscriptions /> },
];

export const protectedRoutes: AppRoute[] = [
  { path: '/profile', element: <Profile /> },
  { path: '/booking/view/:id/:code', element: <ReservationClient /> },
  { path: '/favorites', element: <Favorites /> },
  { path: '/notifications', element: <Notifications /> },
  { path: '/settings/:tab?', element: <Settings /> },
  { path: '/account/:tab?/*', element: <AccountTabsPage /> },
  // alte rute client
];

export const adminRoutes: AppRoute[] = [
  { path: '/dashboard', element: <Dashboard /> },
  { path: '/properties/:tab?', element: <LocationsPage /> },
  { path: '/messages', element: <MessagesAdmin/>},
  { path: '/properties/edit/:slug', element: <LocationPage /> },
  { path: '/pending-bookings', element: <PendingBookings /> },
  { path: '/bookings/:tab?', element: <BookingsPage /> },
  { path: '/bookings/edit/:code/:tab?', element: <BookingPage /> },
  { path: '/calendar/:tab?', element: <Calendar /> },
  { path: '/subscriptions', element: <Subscriptions /> },
  { path: '/notifications', element: <NotificationsAdmin /> },
  { path: '/analytics', element: <Analytics /> },
  { path: '/settings/:tab?', element: <SettingsAdmin /> },

  // alte rute admin
];
