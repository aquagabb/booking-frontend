
import Login from '../pages/Login';
import Register from '../pages/Register';
import Restaurants from '../pages/Restaurants';
import Restaurant from '../pages/Restaurant';
import CheckoutContainer from '../pages/CheckoutContainer';
import CheckoutSuccess from '../pages/CheckoutSuccess';

import Profile from '../pages/protected/Profile';

import Home from '../pages/Home';
import type { ReactElement } from 'react';

import PartnerPage from '../pages/PartnerPage';

import Favorites from '../pages/protected/Favorites';
import Notifications from '../pages/protected/Notifications';
import Settings from '../pages/protected/Settings';
import Subscriptions from '../pages/Subscriptions';
import GoogleCallback from '../pages/GoogleCallback';

import AccountTabsPage from '../pages/protected/AccountTabs';
import ReservationClient from '../pages/protected/client/Reservations/ReservationClient';
import MessagesAdmin from '../pages/protected/MessagesAdmin';

import PartnerRegister from '../pages/PartnerRegister';
import PartnerBecomePage from '../pages/PartnerBecomePage';

import NotificationsAdmin from '../pages/NotificationsAdmin';


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
