import { Navigate, Outlet } from 'react-router-dom';
import { useUserStore } from '../store/user.store';
import type { ReactNode, FC } from 'react';


export const ProtectedRoute = ({ layout: Layout, children }: {
  layout: FC<{ children: ReactNode }>;
  children: ReactNode;
}) => {
  const user = useUserStore((state) => state.user);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Layout>{children}</Layout>;

  // return <Outlet />;
};
