import { Navigate, useLocation } from 'react-router-dom';
import { useUserStore } from '../store/user.store';
import type { ReactNode } from 'react';

/** Rute accesibile doar când NU ești logat (ex. /login). Un user logat e trimis în dashboard. */
export const GuestRoute = ({ children }: { children: ReactNode }) => {
  const user = useUserStore((state) => state.user);
  const hasHydrated = useUserStore((state) => state.hasHydrated);
  const location = useLocation();

  if (!hasHydrated) {
    return null;
  }

  if (user?.token) {
    const redirectPath = (location.state as { redirectPath?: string } | null)?.redirectPath;
    return <Navigate to={redirectPath || '/partner/dashboard'} replace />;
  }

  return <>{children}</>;
};
