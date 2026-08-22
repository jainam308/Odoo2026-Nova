import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { CreateTrip } from './pages/trips/CreateTrip';
import { TripList } from './pages/trips/TripList';
import { ItineraryView } from './pages/trips/ItineraryView';
import { ItineraryBuilder } from './pages/trips/ItineraryBuilder';
import { Dashboard } from './pages/trips/Dashboard';
import { PublicTripView } from './pages/trips/PublicTripView';
import { ExploreDestinations } from './pages/trips/ExploreDestinations';
import { Compass, PlusCircle, MapPin, ListOrdered } from 'lucide-react';

function NavigationBar() {
  const location = useLocation();

  const isCurrent = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-xl font-black text-[#0F6E6E] tracking-tight">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0F6E6E] to-[#2B8A8A] flex items-center justify-center text-white shadow-sm">
            <Compass className="h-5 w-5" />
          </div>
          <span>GlobeTrotter</span>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-4">
          <Link
            to="/explore"
            className={`text-sm font-semibold flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${
              isCurrent('/explore')
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

          <Link
            to="/trips/new"
            className="text-sm font-bold text-white bg-[#FF7A59] hover:bg-[#e66948] flex items-center gap-1.5 px-4 py-2 rounded-xl shadow-sm transition-all transform hover:-translate-y-0.5"
          >
            <PlusCircle className="h-4 w-4" />
            Plan Trip
          </Link>
        </nav>
      </div>
    </header>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#F9FAFB] flex flex-col font-sans">
        <NavigationBar />

        {/* Content Routes */}
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/trips" element={<TripList />} />
            <Route path="/trips/new" element={<CreateTrip />} />
            <Route path="/trips/:id" element={<ItineraryView />} />
            <Route path="/trips/:id/builder" element={<ItineraryBuilder />} />
            <Route path="/trips/share/:slug" element={<PublicTripView />} />
            <Route path="/explore" element={<ExploreDestinations />} />
            {/* Fallback */}
            <Route path="*" element={<Dashboard />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;


