import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import ProfilePage from './pages/profile/ProfilePage';
import SearchPage from './pages/discovery/SearchPage';
import { CreateTrip } from './pages/trips/CreateTrip';
import { TripList } from './pages/trips/TripList';
import { ItineraryView } from './pages/trips/ItineraryView';
import { ItineraryBuilder } from './pages/trips/ItineraryBuilder';
import { PublicTripView } from './pages/trips/PublicTripView';
import { ExploreDestinations } from './pages/trips/ExploreDestinations';
import ItineraryRoutes from './pages/itinerary/ItineraryRoutes';
import './App.css';

const NavigationWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  return (
    <div className="app-container">
      <Navbar user={user} onLogout={logout} />
      <main className="main-content">{children}</main>
    </div>
  );
};

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NavigationWrapper>
          <Routes>
            {/* Module A Screens */}
            <Route path="/" element={<DashboardPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/discover" element={<SearchPage />} />
            <Route path="/cities" element={<SearchPage />} />
            <Route path="/activities" element={<SearchPage />} />
            <Route path="/explore" element={<ExploreDestinations />} />
            <Route path="/trips" element={<TripList />} />
            <Route path="/trips/new" element={<CreateTrip />} />
            <Route path="/trips/:id" element={<ItineraryView />} />
            <Route path="/trips/:id/builder" element={<ItineraryBuilder />} />
            <Route path="/trips/share/:slug" element={<PublicTripView />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            <Route path="/itinerary/*" element={<ItineraryRoutes />} />

            {/* Fallbacks for navigation links */}
            <Route path="/calendar" element={<Navigate to="/profile" replace />} />
            <Route path="/community" element={<Navigate to="/" replace />} />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </NavigationWrapper>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
