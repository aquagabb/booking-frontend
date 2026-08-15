
import { Outlet } from 'react-router-dom';

const PublicLayout = () => {
  return (
    <>
      <div className="max-w-screen-xl mx-auto py-4 mt-4 px-8">
        <Outlet />
      </div>
    </>
  );
};

export default PublicLayout;