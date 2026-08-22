import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Compass,
  MapPin,
  Calendar,
  Plus,
  Sparkles,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { fetchTrips } from '../../api/trips.api';
import { discoveryApi, City } from '../../api/discovery.api';
import { Trip } from '../../types/trip';
import { safeImageUrl } from '../../utils/safeUrl';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [destinations, setDestinations] = useState<City[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      try {
        const [tripsData, citiesData] = await Promise.all([
          fetchTrips(),
          discoveryApi.getCities(),
        ]);
        if (!ignore) {
          setTrips(tripsData);
          setDestinations(citiesData);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    load();
    return () => {
      ignore = true;
    };
  }, []);

  const totalStops = trips.reduce((acc, t) => acc + (t.stops?.length || 0), 0);
  const totalCost = trips.reduce((acc, t) => acc + (t.estimated_cost || 0), 0);

  const getCostLabel = (costIndex?: number) => {
    if (!costIndex || costIndex <= 2) return 'Budget';
    if (costIndex <= 4) return 'Moderate';
    return 'Luxury';
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-16">
      {/* Hero Banner */}
      <div className="relative bg-gradient-to-br from-[#0B4A4A] via-[#0F6E6E] to-[#164E63] text-white py-16 px-4 sm:px-6 lg:px-8 overflow-hidden shadow-sm">
        {/* Background decorative pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-teal-200 text-xs font-semibold uppercase tracking-wider mb-4">
              <Sparkles size={13} className="text-[#FF7A59]" />
              GlobeTrotter Travel Planner
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight mb-4">
              Design Your Perfect Multi-City Itinerary
            </h1>
            <p className="text-teal-100 text-base sm:text-lg mb-8 leading-relaxed">
              Explore dream destinations, build day-wise schedules, estimate trip budgets, and organize memorable activities with ease.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => navigate('/trips/new')}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#FF7A59] hover:bg-[#e66948] text-white font-bold text-sm shadow-md transition-all transform hover:-translate-y-0.5"
              >
                <Plus size={18} />
                Plan New Trip
              </button>

              <Link
                to="/explore"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-semibold text-sm border border-white/20 transition-all"
              >
                <Compass size={18} />
                Explore Destinations
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-12">
        {/* Key Highlights Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-[#0F6E6E]/10 rounded-2xl text-[#0F6E6E]">
              <Compass size={28} />
            </div>
            <div>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Active Itineraries
              </span>
              <div className="text-2xl font-bold text-gray-900 mt-0.5">{trips.length} Trips</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-[#FF7A59]/10 rounded-2xl text-[#FF7A59]">
              <MapPin size={28} />
            </div>
            <div>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Planned Destinations
              </span>
              <div className="text-2xl font-bold text-gray-900 mt-0.5">{totalStops} Cities</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
              <TrendingUp size={28} />
            </div>
            <div>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Estimated Spend
              </span>
              <div className="text-2xl font-bold text-gray-900 mt-0.5">₹{totalCost.toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* Section: Recent Trips */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Recent Trips</h2>
              <p className="text-gray-500 text-xs mt-0.5">Pick up where you left off</p>
            </div>

            <Link
              to="/trips"
              className="text-sm font-semibold text-[#0F6E6E] hover:underline flex items-center gap-1"
            >
              View All <ArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-52 bg-white rounded-2xl animate-pulse border border-gray-100"></div>
              ))}
            </div>
          ) : trips.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 shadow-sm">
              <p className="text-sm text-gray-500 mb-3">No trips created yet.</p>
              <button
                onClick={() => navigate('/trips/new')}
                className="px-4 py-2 bg-[#FF7A59] text-white text-xs font-bold rounded-xl"
              >
                Plan First Trip
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {trips.slice(0, 3).map((trip) => (
                <div
                  key={trip.id}
                  onClick={() => navigate(`/trips/${trip.id}`)}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden flex flex-col group"
                >
                  <div className="relative h-40 bg-gray-100 overflow-hidden">
                    <img
                      src={safeImageUrl(trip.cover_photo_url, 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80')}
                      alt={trip.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                    <div className="absolute bottom-3 left-3 text-white">
                      <h3 className="font-bold text-base leading-tight drop-shadow-sm">{trip.name}</h3>
                      <span className="text-[11px] text-gray-200 flex items-center gap-1 mt-0.5">
                        <Calendar size={11} /> {trip.start_date || 'Upcoming'}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <p className="text-xs text-gray-500 line-clamp-2 mb-3">
                      {trip.description || 'Custom multi-city journey'}
                    </p>
                    <div className="flex items-center justify-between text-xs pt-3 border-t border-gray-100">
                      <span className="font-semibold text-gray-700">
                        {trip.stops?.length || 0} stops
                      </span>
                      <span className="font-bold text-[#0F6E6E]">
                        View Details →
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section: Popular / Recommended Destinations */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Explore Top Destinations</h2>
              <p className="text-gray-500 text-xs mt-0.5">Inspirational cities with rich activities to add to your plan</p>
            </div>

            <Link
              to="/explore"
              className="text-sm font-semibold text-[#0F6E6E] hover:underline flex items-center gap-1"
            >
              Explore All <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {destinations.slice(0, 4).map((dest) => (
              <div
                key={dest.id}
                onClick={() => navigate('/explore')}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden cursor-pointer group flex flex-col"
              >
                <div className="relative h-44 overflow-hidden bg-gray-100">
                  <img
                    src={safeImageUrl(dest.image_url, 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80')}
                    alt={dest.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 bg-black/40 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-full">
                    {dest.country}
                  </div>
                  <div className="absolute bottom-3 left-3 text-white">
                    <h3 className="font-bold text-lg drop-shadow-sm leading-tight">{dest.name}</h3>
                    <p className="text-xs text-gray-200">{dest.country}</p>
                  </div>
                </div>

                <div className="p-4 flex items-center justify-between text-xs text-gray-500">
                  <span>Popularity: {dest.popularity || 90}%</span>
                  <span className="px-2 py-0.5 bg-gray-100 rounded-md font-medium text-gray-700">
                    {getCostLabel(dest.cost_index)} Cost
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
