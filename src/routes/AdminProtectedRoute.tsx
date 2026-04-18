import { Navigate } from 'react-router-dom';
import { useUserStore } from '../store/user.store';
import { useAdminStore } from '../store/admin.store';
import type { ReactNode, FC } from 'react';

export const AdminProtectedRoute = ({ layout: Layout, children }: {
  layout: FC<{ children: ReactNode }>;
  children: ReactNode;
}) => {
  const user = useUserStore((state) => state.user);
  const { organization } = useAdminStore();


  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // // Then check if user has admin/owner role
  // if (!organization || (organization.role !== 'admin' && organization.role !== 'owner')) {
  //   return <Navigate to="/" replace />;
  // }

  return <Layout>{children}</Layout>;
};


