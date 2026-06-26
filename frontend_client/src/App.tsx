import './App.css';
import './styles/tailwind.css';

import { Routes, Route } from 'react-router-dom';

import { publicRoutes, protectedRoutes } from './routes';
import PublicLayout from './layout/PublicLayout';
import ClientLayout from './layout/ClientLayout';


import { ProtectedRoute } from './routes/ProtectedRoute';
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
            <ProtectedRoute layout={ClientLayout}>
              <></>
            </ProtectedRoute>
          }
        >
          {protectedRoutes.map(({ path, element }) => (
            <Route key={path} path={path} element={element} />
          ))}
        </Route>


        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      <Footer />
    </>
  );
}

export default App;
