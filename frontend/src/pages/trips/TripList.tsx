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
  Globe,
  AlertCircle,
  Check,
} from 'lucide-react';
import { fetchTrips, deleteTrip, createTrip } from '../../api/trips.api';
import { getCities, createStop, City } from '../../api/itinerary.api';
import { Trip } from '../../types/trip';
import { safeImageUrl } from '../../utils/safeUrl';
import Card from '../../components/Card';
import Button from '../../components/Button';

interface SuggestionCard {
  id: number;
  cityId: number;
  cityName: string;
  country: string;
  title: string;
  activities: string[];
  imageUrl: string;
  category: string;
  costLabel: string;
}

const SUGGESTIONS: SuggestionCard[] = [
  {
    id: 1,
    cityId: 1,
    cityName: 'Paris',
    country: 'France',
    title: 'Parisian Charm & Culture',
    activities: ['Eiffel Tower visit', 'Louvre Museum', 'Seine dinner cruise'],
    imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80',
    category: 'Sightseeing',
    costLabel: 'Luxury ($$$)',
  },
  {
    id: 2,
    cityId: 2,
    cityName: 'Tokyo',
    country: 'Japan',
    title: 'Tokyo Neon & Temples',
    activities: ['Senso-ji Temple', 'Shibuya food tour', 'Akihabara night walk'],
    imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&q=80',
    category: 'Culture',
    costLabel: 'Moderate ($$)',
  },
  {
    id: 3,
    cityId: 4,
    cityName: 'Rome',
    country: 'Italy',
    title: 'Imperial Rome & Cuisine',
    activities: ['Colosseum tour', 'Vatican Museums', 'Trastevere food walk'],
    imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=80',
    category: 'History',
    costLabel: 'Moderate ($$)',
  },
  {
    id: 4,
    cityId: 5,
    cityName: 'Bali',
    country: 'Indonesia',
    title: 'Tropical Bali Retreat',
    activities: ['Ubud rice terraces', 'Surf lesson', 'Temple sunset'],
    imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80',
    category: 'Adventure',
    costLabel: 'Budget ($)',
  },
  {
    id: 5,
    cityId: 3,
    cityName: 'Goa',
    country: 'India',
    title: 'Sun, Sand & Goan Food',
    activities: ['Baga Beach visit', 'Water sports', 'Goan seafood dinner'],
    imageUrl: 'https://images.unsplash.com/photo-1512343800234-882532365801?w=800&q=80',
    category: 'Relaxation',
    costLabel: 'Budget ($)',
  },
  {
    id: 6,
    cityId: 6,
    cityName: 'New York',
    country: 'USA',
    title: 'NYC Broadway & Skyline',
    activities: ['Statue of Liberty', 'Broadway show', 'Central Park bike'],
    imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80',
    category: 'Urban',
    costLabel: 'Luxury ($$$)',
  },
];

export const TripList: React.FC = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [creatingTrip, setCreatingTrip] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Screen 4 Form state
  const [name, setName] = useState<string>('');
  const [selectedCityId, setSelectedCityId] = useState<number | ''>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedSuggestionId, setSelectedSuggestionId] = useState<number | null>(null);

  // Filters for previous trips list
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'ongoing' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    let ignore = false;
    const loadData = async () => {
      try {
        const [tripsData, citiesData] = await Promise.all([
          fetchTrips().catch(() => []),
          getCities().catch(() => []),
        ]);

        if (!ignore) {
          setTrips(tripsData);
          setCities(citiesData);
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to load trips data:', err);
        if (!ignore) setLoading(false);
      }
    };

    loadData();
    return () => {
      ignore = true;
    };
  }, []);

  const handleSelectSuggestion = (s: SuggestionCard) => {
    setSelectedSuggestionId(s.id);
    setSelectedCityId(s.cityId);
    if (!name || name === 'My Trip') {
      setName(`Trip to ${s.cityName}`);
    }
  };

  const handleCreateTripSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError('Please enter a trip name.');
      return;
    }
    if (!selectedCityId) {
      setFormError('Please select a place / destination city.');
      return;
    }
    if (!startDate) {
      setFormError('Please select a start date.');
      return;
    }
    if (!endDate) {
      setFormError('Please select an end date.');
      return;
    }
    if (endDate < startDate) {
      setFormError('End date cannot be earlier than start date.');
      return;
    }

    setCreatingTrip(true);
    try {
      const createdTrip = await createTrip({
        name: name.trim(),
        description: `Multi-city trip starting in ${cities.find((c) => c.id === selectedCityId)?.name || 'destination'}`,
        start_date: startDate,
        end_date: endDate,
        is_public: true,
      });

      await createStop(createdTrip.id, {
        cityId: Number(selectedCityId),
        startDate: startDate,
        endDate: endDate,
        orderIndex: 0,
      }).catch(() => {});

      navigate(`/itinerary?tripId=${createdTrip.id}`);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to create trip. Please try again.');
    } finally {
      setCreatingTrip(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this trip itinerary?')) {
      await deleteTrip(id);
      setTrips((prev) => prev.filter((t) => t.id !== id));
    }
  };

  const parseLocalDate = (dateStr: string): Date => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day, 12, 0, 0);
  };

  const getTripStatus = (trip: Trip): 'ongoing' | 'upcoming' | 'completed' => {
    const now = new Date();
    const start = parseLocalDate(trip.start_date);
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
      (trip.stops && trip.stops.some((s) => s.city_name.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesFilter && matchesSearch;
  });

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
    <div className="min-h-screen bg-[#F9FAFB] py-8 px-4 sm:px-6 lg:px-8 pb-24">
      <div className="max-w-7xl mx-auto space-y-10 font-sans">
        {/* 1. Screen 4 "Plan a new trip" Form Container */}
        <Card className="p-6 sm:p-8 space-y-6">
          <div className="border-b border-gray-100 pb-4 flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0F6E6E]/10 text-[#0F6E6E] text-xs font-bold uppercase tracking-wider mb-2">
                <Compass size={14} />
                Screen 4 — Create a new Trip
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                Plan a new trip
              </h1>
            </div>
            <span className="text-xs font-semibold text-gray-400">Step 1 of Planning</span>
          </div>

          {formError && (
            <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-xs font-semibold text-red-700 flex items-center gap-2">
              <AlertCircle size={16} className="text-red-500 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleCreateTripSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Trip Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Trip Name: <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Start Date: (e.g. Summer Odyssey)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 outline-none focus:border-[#0F6E6E] bg-white font-medium"
                  />
                </div>
              </div>

              {/* Select a Place */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Select a Place : <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Compass className="absolute left-3.5 top-3 text-[#0F6E6E]" size={18} />
                  <select
                    value={selectedCityId}
                    onChange={(e) => setSelectedCityId(e.target.value ? Number(e.target.value) : '')}
                    required
                    className="w-full pl-11 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 outline-none focus:border-[#0F6E6E] bg-white font-medium cursor-pointer"
                  >
                    <option value="">— Select a Place —</option>
                    {cities.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}, {c.country}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Start Date */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Start Date: <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-3 text-gray-400" size={18} />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 outline-none focus:border-[#0F6E6E] bg-white font-medium"
                  />
                </div>
              </div>

              {/* End Date */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  End Date: <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-3 text-gray-400" size={18} />
                  <input
                    type="date"
                    min={startDate || undefined}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 outline-none focus:border-[#0F6E6E] bg-white font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Form Submit */}
            <div className="pt-3 border-t border-gray-100 flex items-center justify-end">
              <Button
                variant="accent"
                type="submit"
                disabled={creatingTrip}
                className="px-6 py-2.5 text-sm font-extrabold shadow-md"
              >
                {creatingTrip ? 'Creating Trip...' : 'Create Trip →'}
              </Button>
            </div>
          </form>
        </Card>

        {/* 2. Screen 4 "Suggestion for Places to Visit/Activites to preform" Section */}
        <div className="space-y-5">
          <div className="flex items-center justify-between border-b border-gray-200 pb-3">
            <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
              <Sparkles size={20} className="text-[#FF7A59]" />
              Suggestion for Places to Visit/Activites to preform
            </h2>
            <span className="text-xs font-bold text-gray-400">Click a card to auto-select</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SUGGESTIONS.map((s) => {
              const isSelected = selectedSuggestionId === s.id;

              return (
                <div
                  key={s.id}
                  onClick={() => handleSelectSuggestion(s)}
                  className={`bg-white rounded-3xl border transition-all overflow-hidden cursor-pointer flex flex-col justify-between group ${
                    isSelected
                      ? 'border-[#0F6E6E] shadow-md ring-2 ring-[#0F6E6E]/20'
                      : 'border-gray-200 shadow-xs hover:shadow-md'
                  }`}
                >
                  <div className="relative h-48 overflow-hidden bg-gray-100">
                    <img
                      src={s.imageUrl}
                      alt={s.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                    <div className="absolute top-3 left-3 bg-black/40 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full">
                      {s.country}
                    </div>

                    <div className="absolute top-3 right-3 bg-[#0F6E6E] text-white text-xs font-extrabold px-2.5 py-1 rounded-full">
                      {s.category}
                    </div>

                    <div className="absolute bottom-3 left-4 right-4 text-white">
                      <h3 className="font-extrabold text-xl leading-tight drop-shadow-sm">{s.title}</h3>
                      <p className="text-xs text-gray-200">{s.cityName}, {s.country}</p>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
                        Suggested Activities ({s.activities.length})
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {s.activities.map((act, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-700"
                          >
                            {act}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#0F6E6E]">
                        {s.costLabel}
                      </span>
                      <button
                        type="button"
                        className={`inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          isSelected
                            ? 'bg-[#0F6E6E] text-white'
                            : 'bg-gray-100 text-gray-700 group-hover:bg-[#0F6E6E] group-hover:text-white'
                        }`}
                      >
                        {isSelected ? <Check size={14} /> : <Plus size={14} />}
                        {isSelected ? 'Selected' : 'Use Suggestion'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Existing Saved Trips Section */}
        <div className="space-y-6 pt-4">
          <div className="flex items-center justify-between border-b border-gray-200 pb-3">
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                My Travel Itineraries
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#0F6E6E]/10 text-[#0F6E6E]">
                  {trips.length} {trips.length === 1 ? 'Trip' : 'Trips'}
                </span>
              </h2>
            </div>

            <Link
              to="/calendar"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 bg-white text-gray-700 font-bold hover:bg-gray-50 text-xs shadow-xs transition-colors"
            >
              <Calendar size={16} className="text-[#0F6E6E]" />
              Calendar View (Screen 11)
            </Link>
          </div>

          {/* Filters & Search */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
              {(['all', 'upcoming', 'ongoing', 'completed'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all whitespace-nowrap ${
                    filter === tab
                      ? 'bg-[#0F6E6E] text-white shadow-xs'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {tab === 'all' ? 'All Trips' : tab}
                </button>
              ))}
            </div>

            <div className="w-full sm:w-72">
              <input
                type="text"
                placeholder="Search by name, city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 text-xs font-medium rounded-xl border border-gray-200 focus:border-[#0F6E6E] outline-none"
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
                </div>
              ))}
            </div>
          ) : filteredTrips.length === 0 ? (
            <Card className="p-12 text-center max-w-xl mx-auto">
              <Compass size={36} className="text-[#0F6E6E] mx-auto mb-3" />
              <h3 className="text-lg font-bold text-gray-900 mb-1">No trips found</h3>
              <p className="text-gray-500 text-xs mb-4">Fill out the form above to start your first trip.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTrips.map((trip) => {
                const status = getTripStatus(trip);
                const stopCount = trip.stops ? trip.stops.length : 0;

                return (
                  <div
                    key={trip.id}
                    onClick={() => navigate(`/itinerary?tripId=${trip.id}`)}
                    className="group bg-white rounded-3xl border border-gray-200 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer flex flex-col"
                  >
                    <div className="relative h-48 w-full bg-gray-100 overflow-hidden">
                      <img
                        src={safeImageUrl(trip.cover_photo_url, 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80')}
                        alt={trip.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20"></div>

                      <div className="absolute top-3 left-3">{getStatusBadge(status)}</div>

                      {trip.is_public && (
                        <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-md text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1">
                          <Globe size={12} />
                          Public
                        </div>
                      )}

                      <div className="absolute bottom-3 left-3 right-3 text-white">
                        <h3 className="font-extrabold text-lg leading-snug line-clamp-1 drop-shadow-sm">
                          {trip.name}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-gray-200 mt-1 font-medium">
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

                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        {trip.stops && trip.stops.length > 0 ? (
                          <div>
                            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                              Destinations ({stopCount})
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {trip.stops.slice(0, 3).map((stop, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700"
                                >
                                  <MapPin size={11} className="text-[#0F6E6E]" />
                                  {stop.city_name}
                                </span>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-xl flex items-center gap-1.5 font-medium">
                            <Sparkles size={14} />
                            No stops added yet. Open builder to add cities.
                          </div>
                        )}
                      </div>

                      <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-xs font-bold text-[#0F6E6E] group-hover:underline flex items-center gap-1">
                          View Itinerary <ArrowRight size={14} />
                        </span>

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
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TripList;
