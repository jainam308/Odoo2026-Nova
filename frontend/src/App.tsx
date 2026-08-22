import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components';

// Module A Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import ProfilePage from './pages/profile/ProfilePage';
import SearchPage from './pages/discovery/SearchPage';

// Module B Pages
import { CreateTrip } from './pages/trips/CreateTrip';
import { TripList } from './pages/trips/TripList';
import { ItineraryView } from './pages/trips/ItineraryView';
import { ItineraryBuilder } from './pages/trips/ItineraryBuilder';
import { PublicTripView } from './pages/trips/PublicTripView';
import { ExploreDestinations } from './pages/trips/ExploreDestinations';

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
            {/* Module A — Auth & Discovery */}
            <Route path="/" element={<DashboardPage />} />
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

            {/* Module B — Trip Itinerary */}
            <Route path="/explore" element={<ExploreDestinations />} />
            <Route
              path="/trips"
              element={
                <ProtectedRoute>
                  <TripList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/trips/new"
              element={
                <ProtectedRoute>
                  <CreateTrip />
                </ProtectedRoute>
              }
            />
            <Route
              path="/trips/:id"
              element={
                <ProtectedRoute>
                  <ItineraryView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/trips/:id/builder"
              element={
                <ProtectedRoute>
                  <ItineraryBuilder />
                </ProtectedRoute>
              }
            />
            <Route path="/trips/share/:slug" element={<PublicTripView />} />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </NavigationWrapper>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
