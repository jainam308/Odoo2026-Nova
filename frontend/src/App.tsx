import React from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Compass, PlusCircle, MapPin, ListOrdered, User, LogIn, Sparkles } from 'lucide-react';

// Module A pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import ProfilePage from './pages/profile/ProfilePage';
import SearchPage from './pages/discovery/SearchPage';

// Module B pages
import { CreateTrip } from './pages/trips/CreateTrip';
import { TripList } from './pages/trips/TripList';
import { ItineraryView } from './pages/trips/ItineraryView';
import { ItineraryBuilder } from './pages/trips/ItineraryBuilder';
import { Dashboard } from './pages/trips/Dashboard';
import { PublicTripView } from './pages/trips/PublicTripView';
import { ExploreDestinations } from './pages/trips/ExploreDestinations';

// Module C routes
import ItineraryRoutes from './pages/itinerary/ItineraryRoutes';

// AI Module page
import AIChatPage from './pages/ai-chat/AIChatPage';

// ──────────────────────────────────────────────
// Shared Navigation Bar (combines all modules)
// ──────────────────────────────────────────────
function NavigationBar() {
  const location = useLocation();
  const { user, logout } = useAuth();

  const isCurrent = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-xl font-black text-[#0F6E6E] tracking-tight">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0F6E6E] to-[#2B8A8A] flex items-center justify-center text-white shadow-sm">
            <Compass className="h-5 w-5" />
          </div>
          <span>GlobeTrotter</span>
        </Link>

        {/* Nav Links */}
        <nav className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/ai-chat"
            className={`text-sm font-bold flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${
              isCurrent('/ai-chat')
                ? 'bg-[#FF7A59]/15 text-[#FF7A59]'
                : 'text-[#FF7A59] hover:bg-[#FF7A59]/10'
            }`}
          >
            <Sparkles className="h-4 w-4 animate-pulse" />
            <span>AI Planner</span>
          </Link>

          <Link
            to="/explore"
            className={`text-sm font-semibold flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${
              isCurrent('/explore') || isCurrent('/discover') || isCurrent('/cities')
                ? 'bg-[#0F6E6E]/10 text-[#0F6E6E]'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <MapPin className="h-4 w-4 text-[#0F6E6E]" />
            Explore
          </Link>

          <Link
            to="/trips"
            className={`text-sm font-semibold flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${
              isCurrent('/trips') && !isCurrent('/trips/new')
                ? 'bg-[#0F6E6E]/10 text-[#0F6E6E]'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <ListOrdered className="h-4 w-4 text-[#0F6E6E]" />
            My Trips
          </Link>

          {user ? (
            <>
              <Link
                to="/profile"
                className={`text-sm font-semibold flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${
                  isCurrent('/profile')
                    ? 'bg-[#0F6E6E]/10 text-[#0F6E6E]'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <User className="h-4 w-4 text-[#0F6E6E]" />
                Profile
              </Link>
              <button
                onClick={logout}
                className="text-sm font-medium text-gray-500 hover:text-gray-800 px-3 py-2 rounded-xl hover:bg-gray-50 transition-all cursor-pointer"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="text-sm font-semibold flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-gray-600 hover:bg-gray-50 transition-all"
            >
              <LogIn className="h-4 w-4" />
              Login
            </Link>
          )}

          <Link
            to="/trips/new"
            className="text-sm font-bold text-white bg-[#FF7A59] hover:bg-[#e66948] flex items-center gap-1.5 px-4 py-2 rounded-xl shadow-sm transition-all"
          >
            <PlusCircle className="h-4 w-4" />
            Plan Trip
          </Link>
        </nav>
      </div>
    </header>
  );
}

// ──────────────────────────────────────────────
// Protected Route guard (Module A auth)
// ──────────────────────────────────────────────
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

// ──────────────────────────────────────────────
// Main Application Component
// ──────────────────────────────────────────────
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-[#F9FAFB] flex flex-col font-sans">
          <NavigationBar />

          <main className="flex-1">
            <Routes>
              {/* ── Module A – Auth & Discovery ── */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/discover" element={<SearchPage />} />
              <Route path="/cities" element={<SearchPage />} />
              <Route path="/activities" element={<SearchPage />} />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />

              {/* ── Module B – Trip Management & Itinerary Builder ── */}
              <Route path="/" element={<Dashboard />} />
              <Route path="/trips" element={<TripList />} />
              <Route path="/trips/new" element={<CreateTrip />} />
              <Route path="/trips/share/:slug" element={<PublicTripView />} />
              <Route path="/trips/:id/builder" element={<ItineraryBuilder />} />
              <Route path="/trips/:id" element={<ItineraryView />} />
              <Route path="/explore" element={<ExploreDestinations />} />
              <Route path="/dashboard" element={<DashboardPage />} />

              {/* ── AI Assistant Module ── */}
              <Route path="/ai-chat" element={<AIChatPage />} />

              {/* ── Module C – Stops & Calendar Timeline ── */}
              <Route path="/itinerary/*" element={<ItineraryRoutes />} />

              {/* Fallback routes */}
              <Route path="/calendar" element={<Navigate to="/profile" replace />} />
              <Route path="/community" element={<Navigate to="/" replace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
