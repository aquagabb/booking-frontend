import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Onboarding from '../pages/protected/admin/Locations/Onboarding';

const AdminLayout = () => {

  // return <Onboarding/>
  return (
    <div className="flex min-h-screen">
      <aside className="fixed top-16 left-0 h-[calc(100vh-64px)] w-64">
        <Sidebar />
      </aside>
      <main className="ml-64 py-2 w-full">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
