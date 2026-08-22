import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Compass,
  Star,
  Plus
} from 'lucide-react';

interface CityExploreItem {
  id: number;
  name: string;
  country: string;
  region: string;
  costIndex: 'Budget' | 'Moderate' | 'Luxury';
  rating: number;
  image: string;
  description: string;
  topActivities: string[];
}

const CITIES_DATA: CityExploreItem[] = [
  {
    id: 1,
    name: 'Goa',
    country: 'India',
    region: 'South Asia',
    costIndex: 'Moderate',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=80',
    description: 'Sun-kissed beaches, Portuguese colonial architecture, vibrant night markets, and fresh seafood.',
    topActivities: ['Scuba Diving', 'Sunset Cruise', 'Aguada Fort', 'Anjuna Flea Market']
  },
  {
    id: 2,
    name: 'Manali',
    country: 'India',
    region: 'Himalayas',
    costIndex: 'Budget',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&q=80',
    description: 'High altitude Himalayan resort town with snow sports, paragliding in Solang, and cedar forests.',
    topActivities: ['Solang Valley Paragliding', 'Jogini Waterfall Trek', 'Old Manali Cafes', 'Rohtang Pass']
  },
  {
    id: 3,
    name: 'Kyoto',
    country: 'Japan',
    region: 'East Asia',
    costIndex: 'Luxury',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80',
    description: 'Cultural capital of Japan filled with thousands of classical Buddhist temples, gardens, and imperial palaces.',
    topActivities: ['Fushimi Inari Shrine', 'Arashiyama Bamboo Grove', 'Gion Geisha District', 'Kinkaku-ji']
  },
  {
    id: 4,
    name: 'Tokyo',
    country: 'Japan',
    region: 'East Asia',
    costIndex: 'Luxury',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&q=80',
    description: 'Ultramodern neon-lit metropolis mixing futuristic technology, world-class dining, and ancient shrines.',
    topActivities: ['TeamLab Planets', 'Shibuya Crossing', 'Senso-ji Temple', 'Akihabara Tech District']
  },
  {
    id: 5,
    name: 'Paris',
    country: 'France',
    region: 'Europe',
    costIndex: 'Luxury',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80',
    description: 'Global center for art, fashion, gastronomy and culture with iconic landmarks and riverside promenades.',
    topActivities: ['Eiffel Tower Summit', 'Louvre Museum Tour', 'Seine River Cruise', 'Montmartre Walk']
  },
  {
    id: 6,
    name: 'Bali',
    country: 'Indonesia',
    region: 'Southeast Asia',
    costIndex: 'Moderate',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80',
    description: 'Tropical paradise known for its forested volcanic mountains, iconic rice paddies, beaches, and coral reefs.',
    topActivities: ['Ubud Monkey Forest', 'Tegalalang Rice Terraces', 'Tanah Lot Temple', 'Mount Batur Sunrise Trek']
  }
];

export const ExploreDestinations: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState<string>('');
  const [regionFilter, setRegionFilter] = useState<string>('All');
  const [costFilter, setCostFilter] = useState<string>('All');

  const filteredCities = CITIES_DATA.filter((city) => {
    const matchesSearch =
      city.name.toLowerCase().includes(search.toLowerCase()) ||
      city.country.toLowerCase().includes(search.toLowerCase()) ||
      city.topActivities.some((act) => act.toLowerCase().includes(search.toLowerCase()));
    const matchesRegion = regionFilter === 'All' || city.region === regionFilter;
    const matchesCost = costFilter === 'All' || city.costIndex === costFilter;
    return matchesSearch && matchesRegion && matchesCost;
  });

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-16">
      {/* Header Banner */}
      <div className="bg-[#0F6E6E] text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-teal-200 text-xs font-semibold uppercase tracking-wider mb-2">
            <Compass size={16} />
            Destination & Activity Discovery
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Explore Cities & Experiences
          </h1>
          <p className="text-teal-100 text-sm sm:text-base mt-2 max-w-2xl">
            Search top-rated destinations, compare travel costs, and find exciting activities to add directly to your itineraries.
          </p>

          {/* Search bar in Hero */}
          <div className="mt-8 max-w-3xl">
            <div className="bg-white rounded-2xl p-2 shadow-lg flex items-center gap-2">
              <Search className="text-gray-400 ml-3 flex-shrink-0" size={20} />
              <input
                type="text"
                placeholder="Search cities, countries, or activities (e.g. Scuba, Paragliding, Temples)..."
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
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-2">
              Region:
            </span>
            {['All', 'South Asia', 'Himalayas', 'East Asia', 'Europe', 'Southeast Asia'].map((reg) => (
              <button
                key={reg}
                onClick={() => setRegionFilter(reg)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  regionFilter === reg
                    ? 'bg-[#0F6E6E] text-white shadow-sm'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {reg}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-1">
              Cost:
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
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCities.map((city) => (
            <div
              key={city.id}
              className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col group"
            >
              <div className="relative h-56 overflow-hidden">
                <img
                  src={city.image}
                  alt={city.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>

                <div className="absolute top-3 left-3 bg-white/20 backdrop-blur-md text-white text-xs font-semibold px-3 py-1 rounded-full">
                  {city.region}
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
                  <p className="text-xs text-gray-600 leading-relaxed mb-4">
                    {city.description}
                  </p>

                  <div className="mb-4">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
                      Top Experiences
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {city.topActivities.map((act, i) => (
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
                    {city.costIndex} Index
                  </span>

                  <button
                    onClick={() => navigate('/trips/new')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FF7A59] hover:bg-[#e66948] text-white text-xs font-bold shadow-sm transition-all"
                  >
                    <Plus size={14} />
                    Plan with {city.name}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
