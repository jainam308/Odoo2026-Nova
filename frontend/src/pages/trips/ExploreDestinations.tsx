import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Compass,
  Star,
  Plus,
  Loader2
} from 'lucide-react';
import { discoveryApi, City } from '../../api/discovery.api';

interface EnrichedCity extends City {
  rating: number;
  costLabel: 'Budget' | 'Moderate' | 'Luxury';
  activitiesList: string[];
}

export const ExploreDestinations: React.FC = () => {
  const navigate = useNavigate();
  const [cities, setCities] = useState<EnrichedCity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [costFilter, setCostFilter] = useState<string>('All');

  useEffect(() => {
    let ignore = false;
    const loadData = async () => {
      setLoading(true);
      try {
        const [citiesData, activitiesData] = await Promise.all([
          discoveryApi.getCities(),
          discoveryApi.getActivities(),
        ]);

        if (!ignore) {
          const enriched: EnrichedCity[] = citiesData.map((c) => {
            const cityActs = activitiesData
              .filter((a) => a.city_id === c.id)
              .map((a) => a.name);

            const costLabel: 'Budget' | 'Moderate' | 'Luxury' =
              c.cost_index <= 2 ? 'Budget' : c.cost_index <= 4 ? 'Moderate' : 'Luxury';

            return {
              ...c,
              rating: Number((4.5 + (c.popularity % 5) * 0.1).toFixed(1)),
              costLabel,
              activitiesList: cityActs.length > 0 ? cityActs.slice(0, 4) : ['Sightseeing', 'Local Food', 'Walking Tour', 'Photography'],
            };
          });

          setCities(enriched);
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

  const filteredCities = cities.filter((city) => {
    const matchesSearch =
      city.name.toLowerCase().includes(search.toLowerCase()) ||
      city.country.toLowerCase().includes(search.toLowerCase()) ||
      city.activitiesList.some((act) => act.toLowerCase().includes(search.toLowerCase()));

    const matchesCost = costFilter === 'All' || city.costLabel === costFilter;
    return matchesSearch && matchesCost;
  });

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-16">
      {/* Header Banner */}
      <div className="bg-[#0F6E6E] text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-teal-200 text-xs font-semibold uppercase tracking-wider mb-2">
            <Compass size={16} />
            Destination & Activity Catalog (Live Database)
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Explore Cities & Experiences
          </h1>
          <p className="text-teal-100 text-sm sm:text-base mt-2 max-w-2xl">
            Search curated destinations from our Neon PostgreSQL database, compare travel costs, and plan customized itineraries.
          </p>

          {/* Search bar in Hero */}
          <div className="mt-8 max-w-3xl">
            <div className="bg-white rounded-2xl p-2 shadow-lg flex items-center gap-2">
              <Search className="text-gray-400 ml-3 flex-shrink-0" size={20} />
              <input
                type="text"
                placeholder="Search cities, countries, or activities (e.g. Paris, Tokyo, Food, Scuba)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-2 py-2.5 text-sm text-gray-900 outline-none bg-transparent"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="text-xs text-gray-400 hover:text-gray-600 px-2"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Filter & Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Filter bar */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-1">
              Cost Index:
            </span>
            {['All', 'Budget', 'Moderate', 'Luxury'].map((cost) => (
              <button
                key={cost}
                onClick={() => setCostFilter(cost)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  costFilter === cost
                    ? 'bg-[#FF7A59] text-white shadow-sm'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {cost}
              </button>
            ))}
          </div>

          <div className="text-xs text-gray-500 font-medium">
            Showing <span className="font-bold text-gray-900">{filteredCities.length}</span> destinations
          </div>
        </div>

        {/* Results Grid */}
        {loading ? (
          <div className="text-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#0F6E6E] mx-auto mb-3" />
            <p className="text-sm text-gray-500 font-medium">Loading live destinations from database...</p>
          </div>
        ) : filteredCities.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm max-w-lg mx-auto">
            <Compass size={36} className="text-[#0F6E6E] mx-auto mb-3" />
            <h3 className="font-bold text-gray-900 mb-1">No destinations found</h3>
            <p className="text-xs text-gray-500 mb-4">Try adjusting your search query or cost filter.</p>
            <button
              onClick={() => { setSearch(''); setCostFilter('All'); }}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-semibold text-gray-700"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCities.map((city) => (
              <div
                key={city.id}
                className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col group"
              >
                <div className="relative h-56 overflow-hidden bg-gray-100">
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
                    <p className="text-xs text-gray-200">{city.country}</p>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="mb-4">
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
                        Top Experiences ({city.activitiesList.length})
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {city.activitiesList.map((act, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-100 text-xs text-gray-700 font-medium"
                          >
                            {act}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#0F6E6E]/10 text-[#0F6E6E]">
                      {city.costLabel} Index ({city.cost_index}/5)
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
    </div>
  );
};
