import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import PageTransition from './components/PageTransition';

import Home          from './pages/Home';
import Browse        from './pages/Browse';
import TitleDetail   from './pages/TitleDetail';
import Login         from './pages/Login';
import Register      from './pages/Register';
import Profile       from './pages/Profile';
import Wishlist      from './pages/Wishlist';
import PersonDetail  from './pages/PersonDetail';
import RatingHistory from './pages/RatingHistory';

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <div className="min-h-screen flex flex-col bg-ps-bg">
          <Navbar />
          <main className="flex-1">
            <PageTransition>
              <Routes>
                <Route path="/"          element={<Home />} />
                <Route path="/browse"    element={<Browse />} />
                <Route path="/title/:id" element={<TitleDetail />} />
                <Route path="/person/:id"element={<PersonDetail />} />
                <Route path="/login"     element={<Login />} />
                <Route path="/register"  element={<Register />} />
                <Route path="/profile"   element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/wishlist"  element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
                <Route path="/ratings"   element={<ProtectedRoute><RatingHistory /></ProtectedRoute>} />
              </Routes>
            </PageTransition>
          </main>
          <Footer />
        </div>
      </ToastProvider>
    </AuthProvider>
  );
}
