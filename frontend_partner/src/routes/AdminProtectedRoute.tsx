import { Navigate, useLocation } from 'react-router-dom';
import { useUserStore } from '../store/user.store';
import { useAdminStore } from '../store/admin.store';
import type { ReactNode, FC } from 'react';

export const AdminProtectedRoute = ({ layout: Layout, children }: {
  layout: FC<{ children: ReactNode }>;
  children: ReactNode;
}) => {
  const user = useUserStore((state) => state.user);
  const hasHydrated = useUserStore((state) => state.hasHydrated);
  const { organization } = useAdminStore();
  const location = useLocation();

  // Persisted session is read from localStorage asynchronously; wait for it
  // to finish loading before deciding to redirect, otherwise a logged-in
  // user gets briefly bounced to /login on every refresh.
  if (!hasHydrated) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ redirectPath: location.pathname + location.search }} />;
  }

  // // Then check if user has admin/owner role
  // if (!organization || (organization.role !== 'admin' && organization.role !== 'owner')) {
  //   return <Navigate to="/" replace />;
  // }

  return <Layout>{children}</Layout>;
};


