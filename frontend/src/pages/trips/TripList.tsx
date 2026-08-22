import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Plus,
  Trash2,
  Compass,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
  Globe
} from 'lucide-react';
import { fetchTrips, deleteTrip } from '../../api/trips.api';
import { Trip } from '../../types/trip';
import { safeImageUrl } from '../../utils/safeUrl';

export const TripList: React.FC = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'ongoing' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');


  useEffect(() => {
    let ignore = false;
    const load = async () => {
      try {
        const data = await fetchTrips();
        if (!ignore) {
          setTrips(data);
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to load trips:', err);
        if (!ignore) setLoading(false);
      }
    };
    load();
    return () => {
      ignore = true;
    };
  }, []);


  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this trip itinerary?')) {
      await deleteTrip(id);
      setTrips((prev) => prev.filter((t) => t.id !== id));
    }
  };

  /**
   * Parse a YYYY-MM-DD date string as LOCAL noon to avoid UTC-offset issues.
   * e.g. "2026-09-10" → 2026-09-10T12:00:00 in the device's local timezone,
   * so the same calendar date is always classified correctly regardless of timezone.
   */
  const parseLocalDate = (dateStr: string): Date => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day, 12, 0, 0); // noon local time
  };

  const getTripStatus = (trip: Trip): 'ongoing' | 'upcoming' | 'completed' => {
    const now = new Date();
    const start = parseLocalDate(trip.start_date);
    // End of day: set to 23:59:59 so an ongoing trip is still "ongoing" all day on end_date
    const endDay = parseLocalDate(trip.end_date);
    endDay.setHours(23, 59, 59, 999);

    if (now >= start && now <= endDay) return 'ongoing';
    if (now < start) return 'upcoming';
    return 'completed';
  };

  const filteredTrips = trips.filter((trip) => {
    const status = getTripStatus(trip);
    const matchesFilter = filter === 'all' || status === filter;
    const matchesSearch =
      trip.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (trip.description && trip.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (trip.stops && trip.stops.some(s => s.city_name.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesFilter && matchesSearch;
  });

  // Count per tab for badges
  const tabCounts = {
    all: trips.length,
    upcoming: trips.filter(t => getTripStatus(t) === 'upcoming').length,
    ongoing: trips.filter(t => getTripStatus(t) === 'ongoing').length,
    completed: trips.filter(t => getTripStatus(t) === 'completed').length,
  };

  const getStatusBadge = (status: 'ongoing' | 'upcoming' | 'completed') => {
    switch (status) {
      case 'ongoing':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Ongoing
          </span>
        );
      case 'upcoming':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock size={12} />
            Upcoming
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
            <CheckCircle2 size={12} />
            Completed
          </span>
        );
    }
  };


  return (
    <div className="min-h-screen bg-[#F9FAFB] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
              My Travel Itineraries
              <span className="text-sm font-medium px-2.5 py-0.5 rounded-full bg-[#0F6E6E]/10 text-[#0F6E6E]">
                {trips.length} {trips.length === 1 ? 'Trip' : 'Trips'}
              </span>
            </h1>
            <p className="text-gray-500 mt-1 text-sm">
              Manage your custom multi-city journeys, explore day-wise itineraries, and organize activities.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/explore"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-50 text-sm shadow-sm transition-colors"
            >
              <Compass size={18} className="text-[#0F6E6E]" />
              Explore Cities
            </Link>

            <button
              onClick={() => navigate('/trips/new')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FF7A59] hover:bg-[#e66948] text-white font-medium text-sm shadow-sm transition-colors"
            >
              <Plus size={18} />
              Plan New Trip
            </button>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
            {(['all', 'upcoming', 'ongoing', 'completed'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all whitespace-nowrap ${
                  filter === tab
                    ? 'bg-[#0F6E6E] text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab === 'all' ? 'All Trips' : tab}
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                  filter === tab
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {tabCounts[tab]}
                </span>
              </button>
            ))}
          </div>

          <div className="w-full sm:w-72">
            <input
              type="text"
              placeholder="Search by name, city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 text-sm rounded-xl border border-gray-200 focus:border-[#0F6E6E] focus:ring-1 focus:ring-[#0F6E6E] outline-none"
            />
          </div>
        </div>

        {/* Trips Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm animate-pulse">
                <div className="h-44 bg-gray-200 rounded-xl mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-10 bg-gray-100 rounded-xl"></div>
              </div>
            ))}
          </div>
        ) : filteredTrips.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm max-w-xl mx-auto my-12">
            <div className="w-16 h-16 bg-[#0F6E6E]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#0F6E6E]">
              <Compass size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No trips found</h3>
            <p className="text-gray-500 text-sm mb-6">
              {searchQuery || filter !== 'all'
                ? 'Try adjusting your search query or status filter.'
                : "You haven't planned any trips yet. Start designing your first multi-city adventure!"}
            </p>
            <button
              onClick={() => navigate('/trips/new')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#FF7A59] hover:bg-[#e66948] text-white font-medium text-sm shadow-sm transition-colors"
            >
              <Plus size={18} />
              Create Your First Trip
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTrips.map((trip) => {
              const status = getTripStatus(trip);
              const stopCount = trip.stops ? trip.stops.length : 0;
              const activityCount = trip.stops
                ? trip.stops.reduce((acc, s) => acc + (s.activities?.length || 0), 0)
                : 0;

              return (
                <div
                  key={trip.id}
                  onClick={() => navigate(`/trips/${trip.id}`)}
                  className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer flex flex-col"
                >
                  {/* Cover Image Container */}
                  <div className="relative h-48 w-full bg-gray-100 overflow-hidden">
                    <img
                      src={safeImageUrl(trip.cover_photo_url, 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80')}
                      alt={trip.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20"></div>

                    <div className="absolute top-3 left-3">
                      {getStatusBadge(status)}
                    </div>

                    {trip.is_public && (
                      <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-md text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1">
                        <Globe size={12} />
                        Public
                      </div>
                    )}

                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <h3 className="font-bold text-lg leading-snug line-clamp-1 drop-shadow-sm">
                        {trip.name}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-gray-200 mt-1">
                        <Calendar size={13} />
                        <span>
                          {new Date(trip.start_date).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                          })}{' '}
                          -{' '}
                          {new Date(trip.end_date).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Body Info */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      {trip.description && (
                        <p className="text-gray-600 text-xs line-clamp-2 mb-4 leading-relaxed">
                          {trip.description}
                        </p>
                      )}

                      {/* Stops Pill Badges */}
                      {trip.stops && trip.stops.length > 0 ? (
                        <div className="mb-4">
                          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                            Destinations ({stopCount})
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {trip.stops.slice(0, 3).map((stop, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-700"
                              >
                                <MapPin size={11} className="text-[#0F6E6E]" />
                                {stop.city_name}
                              </span>
                            ))}
                            {trip.stops.length > 3 && (
                              <span className="px-2 py-1 bg-gray-50 rounded-lg text-xs text-gray-500 font-medium">
                                +{trip.stops.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="mb-4 text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-xl flex items-center gap-1.5">
                          <Sparkles size={14} />
                          No stops added yet. Open builder to add cities.
                        </div>
                      )}
                    </div>

                    {/* Footer Stats & Actions */}
                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        <span className="font-semibold text-gray-900">{activityCount}</span> Activities
                        {trip.estimated_cost ? (
                          <span className="ml-2 font-semibold text-[#0F6E6E]">
                            • ₹{trip.estimated_cost.toLocaleString()}
                          </span>
                        ) : null}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/trips/${trip.id}/builder`);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-[#0F6E6E]/10 hover:bg-[#0F6E6E]/20 text-[#0F6E6E] text-xs font-semibold flex items-center gap-1 transition-colors"
                        >
                          Builder
                          <ArrowRight size={13} />
                        </button>

                        <button
                          type="button"
                          onClick={(e) => handleDelete(e, trip.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete Trip"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
