import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search,
  Compass,
  Star,
  Plus,
  Loader2,
  Globe,
  SlidersHorizontal,
  Filter,
  ArrowUpDown,
  Calendar,
  MapPin,
  ChevronRight,
} from 'lucide-react';
import { discoveryApi, City } from '../../api/discovery.api';
import { getTrips, Trip } from '../../api/itinerary.api';
import Card from '../../components/Card';
import Button from '../../components/Button';

interface EnrichedCity extends City {
  rating: number;
  costLabel: 'Budget' | 'Moderate' | 'Luxury';
  region: 'Europe' | 'Asia' | 'Americas' | 'Africa' | 'Oceania';
  activitiesList: string[];
}

const REGIONAL_SELECTIONS = [
  {
    name: 'Europe',
    subtitle: 'Paris, Rome, Barcelona, Lisbon',
    count: '4 Destinations',
    image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800&q=80',
    color: 'from-blue-600/80 to-indigo-900/90',
  },
  {
    name: 'Asia',
    subtitle: 'Tokyo, Goa, Bali, Bangkok',
    count: '4 Destinations',
    image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&q=80',
    color: 'from-emerald-600/80 to-teal-900/90',
  },
  {
    name: 'Americas',
    subtitle: 'New York, San Francisco, Cancun',
    count: '3 Destinations',
    image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80',
    color: 'from-amber-600/80 to-orange-900/90',
  },
  {
    name: 'Africa',
    subtitle: 'Cairo, Marrakesh, Dubai',
    count: '3 Destinations',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80',
    color: 'from-purple-600/80 to-purple-950/90',
  },
  {
    name: 'Oceania',
    subtitle: 'Sydney, Auckland, Fiji',
    count: '3 Destinations',
    image: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800&q=80',
    color: 'from-cyan-600/80 to-blue-950/90',
  },
];

export const ExploreDestinations: React.FC = () => {
  const navigate = useNavigate();
  const [cities, setCities] = useState<EnrichedCity[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Search & Filter controls state per wireframe
  const [search, setSearch] = useState<string>('');
  const [groupByRegion, setGroupByRegion] = useState<string>('All');
  const [costFilter, setCostFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'popularity' | 'cost-asc' | 'cost-desc' | 'name'>('popularity');

  useEffect(() => {
    let ignore = false;
    const loadData = async () => {
      setLoading(true);
      try {
        const [citiesData, activitiesData, tripsData] = await Promise.all([
          discoveryApi.getCities().catch(() => []),
          discoveryApi.getActivities().catch(() => []),
          getTrips().catch(() => []),
        ]);

        if (!ignore) {
          const enriched: EnrichedCity[] = citiesData.map((c) => {
            const cityActs = activitiesData
              .filter((a) => a.city_id === c.id)
              .map((a) => a.name);

            const costLabel: 'Budget' | 'Moderate' | 'Luxury' =
              c.cost_index <= 2 ? 'Budget' : c.cost_index <= 4 ? 'Moderate' : 'Luxury';

            let region: 'Europe' | 'Asia' | 'Americas' | 'Africa' | 'Oceania' = 'Europe';
            const countryLower = c.country.toLowerCase();
            if (countryLower.includes('japan') || countryLower.includes('india') || countryLower.includes('indonesia') || countryLower.includes('thailand')) {
              region = 'Asia';
            } else if (countryLower.includes('usa') || countryLower.includes('united states') || countryLower.includes('brazil') || countryLower.includes('mexico')) {
              region = 'Americas';
            } else if (countryLower.includes('egypt') || countryLower.includes('morocco') || countryLower.includes('uae')) {
              region = 'Africa';
            } else if (countryLower.includes('australia') || countryLower.includes('zealand')) {
              region = 'Oceania';
            }

            return {
              ...c,
              rating: Number((4.5 + (c.popularity % 5) * 0.1).toFixed(1)),
              costLabel,
              region,
              activitiesList: cityActs.length > 0 ? cityActs.slice(0, 4) : ['Sightseeing', 'Local Food', 'Walking Tour', 'Photography'],
            };
          });

          setCities(enriched);
          setTrips(tripsData);
        }
      } catch (err) {
        console.error('Failed to load discovery data from DB:', err);
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    loadData();
    return () => {
      ignore = true;
    };
  }, []);

  // Filter & Sort Logic
  const filteredCities = cities
    .filter((city) => {
      const matchesSearch =
        city.name.toLowerCase().includes(search.toLowerCase()) ||
        city.country.toLowerCase().includes(search.toLowerCase()) ||
        city.activitiesList.some((act) => act.toLowerCase().includes(search.toLowerCase()));

      const matchesRegion = groupByRegion === 'All' || city.region === groupByRegion;
      const matchesCost = costFilter === 'All' || city.costLabel === costFilter;
      return matchesSearch && matchesRegion && matchesCost;
    })
    .sort((a, b) => {
      if (sortBy === 'cost-asc') return a.cost_index - b.cost_index;
      if (sortBy === 'cost-desc') return b.cost_index - a.cost_index;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return b.popularity - a.popularity;
    });

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-24 relative">
      {/* 1. Banner Image Hero Section (Per Screen 3 Wireframe) */}
      <div className="relative h-80 sm:h-96 w-full overflow-hidden bg-gray-900">
        <img
          src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1600&q=80"
          alt="GlobeTrotter Banner"
          className="w-full h-full object-cover object-center opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-900/50 to-transparent"></div>

        <div className="absolute inset-0 flex items-center justify-center text-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider">
              <Compass size={16} />
              GlobeTrotter Multi-City Exploration
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight drop-shadow-md">
              Discover Destinations & Build Itineraries
            </h1>
            <p className="text-gray-200 text-sm sm:text-base max-w-2xl mx-auto font-medium drop-shadow-xs">
              Explore curated global cities, compare costs, browse popular activities, and seamlessly assemble your next multi-city trip.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10 space-y-10">
        {/* 2. Search, Group by, Filter & Sort Controls Bar (Per Screen 3 Wireframe) */}
        <div className="bg-white p-4 rounded-3xl border border-gray-200 shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search bar */}
          <div className="relative w-full md:w-96">
            <Search size={18} className="absolute left-3.5 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search bar ......"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 outline-none focus:border-[#0F6E6E]"
            />
          </div>

          {/* Controls: Group by, Filter, Sort by */}
          <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
            {/* Group by Region */}
            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl text-xs font-bold text-gray-700">
              <SlidersHorizontal size={14} className="text-gray-500" />
              <span>Group by:</span>
              <select
                value={groupByRegion}
                onChange={(e) => setGroupByRegion(e.target.value)}
                className="bg-transparent text-xs font-bold outline-none cursor-pointer"
              >
                <option value="All">All Regions</option>
                <option value="Europe">Europe</option>
                <option value="Asia">Asia</option>
                <option value="Americas">Americas</option>
                <option value="Africa">Africa</option>
                <option value="Oceania">Oceania</option>
              </select>
            </div>

            {/* Filter Cost */}
            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl text-xs font-bold text-gray-700">
              <Filter size={14} className="text-gray-500" />
              <span>Filter:</span>
              <select
                value={costFilter}
                onChange={(e) => setCostFilter(e.target.value)}
                className="bg-transparent text-xs font-bold outline-none cursor-pointer"
              >
                <option value="All">All Costs</option>
                <option value="Budget">Budget ($)</option>
                <option value="Moderate">Moderate ($$)</option>
                <option value="Luxury">Luxury ($$$)</option>
              </select>
            </div>

            {/* Sort by */}
            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl text-xs font-bold text-gray-700">
              <ArrowUpDown size={14} className="text-gray-500" />
              <span>Sort by...</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'popularity' | 'cost-asc' | 'cost-desc' | 'name')}
                className="bg-transparent text-xs font-bold outline-none cursor-pointer"
              >
                <option value="popularity">Popularity</option>
                <option value="cost-asc">Cost: Low to High</option>
                <option value="cost-desc">Cost: High to Low</option>
                <option value="name">Name A-Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* 3. Top Regional Selections Section (Per Screen 3 Wireframe) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-gray-200 pb-3">
            <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
              <Globe className="text-[#0F6E6E]" size={20} />
              Top Regional Selections
            </h2>
            <span className="text-xs font-semibold text-gray-500">Curated Destinations</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {REGIONAL_SELECTIONS.map((reg) => {
              const isSelected = groupByRegion === reg.name;

              return (
                <div
                  key={reg.name}
                  onClick={() => setGroupByRegion(isSelected ? 'All' : reg.name)}
                  className={`relative h-44 rounded-3xl overflow-hidden cursor-pointer group border-2 transition-all ${
                    isSelected ? 'border-[#0F6E6E] shadow-md ring-2 ring-[#0F6E6E]/20' : 'border-transparent shadow-xs hover:shadow-md'
                  }`}
                >
                  <img
                    src={reg.image}
                    alt={reg.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${reg.color}`}></div>

                  <div className="absolute inset-0 p-4 flex flex-col justify-between text-white">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md w-fit">
                      {reg.count}
                    </span>
                    <div>
                      <h3 className="text-lg font-extrabold leading-tight">{reg.name}</h3>
                      <p className="text-xs text-gray-200 truncate mt-0.5 font-medium">{reg.subtitle}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Destination Results Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-gray-200 pb-3">
            <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
              <MapPin className="text-[#FF7A59]" size={20} />
              Featured Destinations ({filteredCities.length})
            </h2>
          </div>

          {loading ? (
            <div className="text-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-[#0F6E6E] mx-auto mb-3" />
              <p className="text-sm text-gray-500 font-medium">Loading live destinations...</p>
            </div>
          ) : filteredCities.length === 0 ? (
            <Card className="p-12 text-center max-w-lg mx-auto">
              <Compass size={36} className="text-[#0F6E6E] mx-auto mb-3" />
              <h3 className="font-bold text-gray-900 mb-1">No destinations found</h3>
              <p className="text-xs text-gray-500 mb-4">Try adjusting your search bar or filter dropdowns.</p>
              <Button
                variant="secondary"
                onClick={() => {
                  setSearch('');
                  setGroupByRegion('All');
                  setCostFilter('All');
                }}
              >
                Reset Filters
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCities.map((city) => (
                <div
                  key={city.id}
                  className="bg-white rounded-3xl border border-gray-200 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col group"
                >
                  <div className="relative h-52 overflow-hidden bg-gray-100">
                    <img
                      src={city.image_url || 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80'}
                      alt={city.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>

                    <div className="absolute top-3 left-3 bg-black/40 backdrop-blur-md text-white text-xs font-semibold px-3 py-1 rounded-full">
                      {city.country}
                    </div>

                    <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-md text-amber-300 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                      <Star size={12} className="fill-amber-400 text-amber-400" />
                      {city.rating}
                    </div>

                    <div className="absolute bottom-3 left-4 right-4 text-white">
                      <h3 className="font-extrabold text-2xl drop-shadow-sm leading-tight">
                        {city.name}
                      </h3>
                      <p className="text-xs text-gray-200">{city.region} Region</p>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
                        Top Experiences ({city.activitiesList.length})
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {city.activitiesList.map((act, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-200 text-xs text-gray-700 font-medium"
                          >
                            {act}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#0F6E6E]/10 text-[#0F6E6E]">
                        {city.costLabel} ({city.cost_index}/5)
                      </span>

                      <button
                        onClick={() => navigate('/trips/new')}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FF7A59] hover:bg-[#e66948] text-white text-xs font-bold shadow-sm transition-all"
                      >
                        <Plus size={14} />
                        Plan Trip
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 4. Previous Trips Section (Per Screen 3 Wireframe) */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between border-b border-gray-200 pb-3">
            <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
              <Calendar className="text-[#0F6E6E]" size={20} />
              Previous Trips
            </h2>
            <Link to="/trips" className="text-xs font-bold text-[#0F6E6E] hover:underline flex items-center gap-1">
              View All Trips <ChevronRight size={14} />
            </Link>
          </div>

          {trips.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-sm font-medium text-gray-500">No previous trips created yet.</p>
              <button
                onClick={() => navigate('/trips/new')}
                className="mt-3 px-4 py-2 rounded-xl bg-[#0F6E6E] text-white text-xs font-bold"
              >
                Create Your First Trip
              </button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {trips.slice(0, 3).map((t) => (
                <div
                  key={t.id}
                  onClick={() => navigate(`/itinerary?tripId=${t.id}`)}
                  className="bg-white rounded-3xl border border-gray-200 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col cursor-pointer group"
                >
                  <div className="relative h-44 overflow-hidden bg-gray-100">
                    <img
                      src={t.coverPhotoUrl || 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800&q=80'}
                      alt={t.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                    <div className="absolute bottom-3 left-4 right-4 text-white">
                      <h3 className="font-extrabold text-xl leading-tight truncate">{t.name}</h3>
                      <p className="text-xs text-gray-200">
                        {t.startDate ? `${t.startDate} → ${t.endDate || ''}` : 'Dates TBD'}
                      </p>
                    </div>
                  </div>
                  <div className="p-4 flex items-center justify-between bg-gray-50 text-xs font-bold text-gray-700">
                    <span>{t.isPublic ? 'Public Itinerary' : 'Private Trip'}</span>
                    <span className="text-[#0F6E6E] group-hover:underline flex items-center gap-1">
                      View Itinerary →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 5. Floating + Plan a Trip Button (Per Screen 3 Wireframe) */}
      <button
        onClick={() => navigate('/trips/new')}
        className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 rounded-full bg-[#FF7A59] hover:bg-[#e66948] text-white px-6 py-3.5 text-sm font-extrabold shadow-xl hover:shadow-2xl transition-all scale-100 hover:scale-105 active:scale-95"
      >
        <Plus size={20} />
        Plan a trip
      </button>
    </div>
  );
};

export default ExploreDestinations;
