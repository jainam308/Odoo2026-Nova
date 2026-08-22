import React from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Compass, PlusCircle, MapPin, ListOrdered, Calendar, User, LogIn, Shield, Sparkles, MessageSquare } from 'lucide-react';

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

// Admin Panel page
import AdminDashboard from './pages/admin/AdminDashboard';

// Module C routes & pages
import ItineraryRoutes from './pages/itinerary/ItineraryRoutes';
import GlobalCalendarPage from './pages/itinerary/GlobalCalendarPage';

// AI Module page
import AIChatPage from './pages/ai-chat/AIChatPage';

// Community Module page
import CommunityPage from './pages/community/CommunityPage';

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
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-xl font-black text-[#0F6E6E] tracking-tight">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0F6E6E] to-[#2B8A8A] flex items-center justify-center text-white shadow-sm">
            <Compass className="h-5 w-5" />
          </div>
          <span>GlobeTrotter</span>
        </Link>

        {/* Nav Links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            to="/ai-chat"
            className={`text-sm font-bold flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all ${
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
            className={`text-sm font-semibold flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all ${
              isCurrent('/explore') || isCurrent('/discover') || isCurrent('/cities')
                ? 'bg-[#0F6E6E]/10 text-[#0F6E6E]'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <MapPin className="h-4 w-4 text-[#0F6E6E]" />
            <span>Explore</span>
          </Link>

          <Link
            to="/trips"
            className={`text-sm font-semibold flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all ${
              isCurrent('/trips') && !isCurrent('/trips/new')
                ? 'bg-[#0F6E6E]/10 text-[#0F6E6E]'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <ListOrdered className="h-4 w-4 text-[#0F6E6E]" />
            <span>My Trips</span>
          </Link>

          <Link
            to="/calendar"
            className={`text-sm font-semibold flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all ${
              isCurrent('/calendar')
                ? 'bg-[#0F6E6E]/10 text-[#0F6E6E]'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Calendar className="h-4 w-4 text-[#0F6E6E]" />
            <span>Calendar</span>
          </Link>

          <Link
            to="/community"
            className={`text-sm font-semibold flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all ${
              isCurrent('/community')
                ? 'bg-[#0F6E6E]/10 text-[#0F6E6E]'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <MessageSquare className="h-4 w-4 text-[#0F6E6E]" />
            <span>Community</span>
          </Link>

          <Link
            to="/itinerary"
            className={`text-sm font-semibold flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all ${
              isCurrent('/itinerary')
                ? 'bg-[#0F6E6E]/10 text-[#0F6E6E]'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Compass className="h-4 w-4 text-[#0F6E6E]" />
            <span>Itinerary Builder</span>
          </Link>

          {user && user.is_admin && (
            <Link
              to="/admin"
              className={`text-sm font-bold flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all ${
                isCurrent('/admin')
                  ? 'bg-purple-700 text-white shadow-sm'
                  : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
              }`}
            >
              <Shield className="h-4 w-4" />
              <span>Admin Panel</span>
            </Link>
          )}

          {user ? (
            <>
              <Link
                to="/profile"
                className={`text-sm font-semibold flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all ${
                  isCurrent('/profile')
                    ? 'bg-[#0F6E6E]/10 text-[#0F6E6E]'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {user.photo_url ? (
                  <img
                    src={user.photo_url}
                    alt={user.first_name || 'Profile'}
                    className="w-5 h-5 rounded-full object-cover border border-[#0F6E6E]"
                  />
                ) : (
                  <User className="h-4 w-4 text-[#0F6E6E]" />
                )}
                <span>{user.first_name || 'Profile'}</span>
              </Link>
              <button
                onClick={logout}
                className="text-sm font-medium text-gray-500 hover:text-gray-800 px-2.5 py-2 rounded-xl hover:bg-gray-50 transition-all cursor-pointer"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="text-sm font-semibold flex items-center gap-1.5 px-3 py-2 rounded-xl text-gray-600 hover:bg-gray-50 transition-all"
            >
              <LogIn className="h-4 w-4" />
              <span>Login</span>
            </Link>
          )}

          <Link
            to="/trips/new"
            className="text-sm font-bold text-white bg-[#FF7A59] hover:bg-[#e66948] flex items-center gap-1.5 px-3.5 py-2 rounded-xl shadow-sm transition-all ml-1"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Plan Trip</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}

// ──────────────────────────────────────────────
// Protected Route guards
// ──────────────────────────────────────────────
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (!user || !user.is_admin) return <Navigate to="/" replace />;
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

              {/* ── Admin Panel Module (Strictly Admin Only) ── */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                }
              />

              {/* ── Module C – Stops & Calendar Timeline ── */}
              <Route path="/itinerary/*" element={<ItineraryRoutes />} />
              <Route path="/calendar" element={<GlobalCalendarPage />} />

              {/* Fallback routes */}
              <Route path="/community" element={<CommunityPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Floating AI Assistant Action Button */}
          <Link
            to="/ai-chat"
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3 rounded-full bg-gradient-to-r from-[#FF7A59] to-[#FF5722] text-white font-bold text-sm shadow-2xl hover:shadow-[#FF7A59]/40 hover:scale-105 transition-all duration-300 ring-4 ring-white"
            title="Ask AI to plan your trip"
          >
            <Sparkles className="h-5 w-5 animate-pulse" />
            <span className="drop-shadow-sm">Plan with AI</span>
          </Link>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
