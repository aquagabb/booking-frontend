
import Login from '../pages/Login';

import type { ReactElement } from 'react';
import Dashboard from '../pages/protected/admin/Dashboard';

import LocationPage from '../pages/protected/admin/LocationPage';
import BookingPage from '../pages/protected/admin/BookingPage';

import SettingsAdmin from '../pages/protected/admin/Settings';
import Subscriptions from '../pages/Subscriptions';

import Analytics from '../pages/protected/admin/Analytics';
import BookingsPage from '../pages/protected/admin/Bookings/BookingsPage';

import MessagesAdmin from '../pages/protected/MessagesAdmin';
import PendingBookings from '../pages/protected/admin/PendingBookings';

import Calendar from '../pages/protected/admin/Calendar';
import NotificationsAdmin from '../pages/NotificationsAdmin';
import LocationsPage from '../pages/protected/admin/LocationsPages';

export type AppRoute = {
  path: string;
  element: ReactElement;
};

export const publicRoutes: AppRoute[] = [
  { path: '/login', element: <Login /> },
];

export const adminRoutes: AppRoute[] = [
  { path: '/dashboard', element: <Dashboard /> },
  { path: '/properties/:tab?', element: <LocationsPage /> },
  { path: '/messages', element: <MessagesAdmin /> },
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
