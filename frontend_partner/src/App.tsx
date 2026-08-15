import './App.css';
import './styles/tailwind.css';

import { Routes, Route } from 'react-router-dom';

import { publicRoutes, adminRoutes } from './routes';
import PublicLayout from './layout/PublicLayout';

import AdminLayout from './layout/AdminLayout';

import { AdminProtectedRoute } from './routes/AdminProtectedRoute';
import Header from './layout/Header';
import Footer from './layout/Footer';
import NotFound from './pages/NotFound';

function App() {
  return (
    <>
      <Header />

      <Routes>

        <Route element={<PublicLayout />}>
          {publicRoutes.map(({ path, element }) => (
            <Route key={path} path={path} element={element} />
          ))}
        </Route>
        <Route
          element={
            <AdminProtectedRoute layout={AdminLayout}>
              <></>
            </AdminProtectedRoute>
          }
        >
          {adminRoutes.map(({ path, element }) => (
            <Route key={path} path={'/partner' + path} element={element} />
          ))}
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>

      <Footer />
    </>
  );
}

export default App;
