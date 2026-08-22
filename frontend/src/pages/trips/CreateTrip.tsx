import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Calendar,
  ArrowLeft,
  Sparkles,
  Check,
  Compass,
  AlertCircle,
  Plus,
} from 'lucide-react';
import { createTrip } from '../../api/trips.api';
import { createStop, getCities, City } from '../../api/itinerary.api';
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

export const CreateTrip: React.FC = () => {
  const navigate = useNavigate();

  const [cities, setCities] = useState<City[]>([]);
  const [name, setName] = useState('');
  const [selectedCityId, setSelectedCityId] = useState<number | ''>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedSuggestionId, setSelectedSuggestionId] = useState<number | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getCities()
      .then((data) => {
        if (active) setCities(data);
      })
      .catch(() => {
        if (active) setCities([]);
      });
    return () => {
      active = false;
    };
  }, []);

  // Handle selecting a suggestion card (Screen 4 Wireframe)
  const handleSelectSuggestion = (s: SuggestionCard) => {
    setSelectedSuggestionId(s.id);
    setSelectedCityId(s.cityId);
    if (!name || name === 'My Trip') {
      setName(`Trip to ${s.cityName}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please enter a trip name.');
      return;
    }
    if (!selectedCityId) {
      setError('Please select a place / destination city.');
      return;
    }
    if (!startDate) {
      setError('Please select a start date.');
      return;
    }
    if (!endDate) {
      setError('Please select an end date.');
      return;
    }
    if (endDate < startDate) {
      setError('End date cannot be earlier than start date.');
      return;
    }

    setLoading(true);
    try {
      // 1. Create the Trip
      const createdTrip = await createTrip({
        name: name.trim(),
        description: `Multi-city trip starting in ${cities.find((c) => c.id === selectedCityId)?.name || 'destination'}`,
        start_date: startDate,
        end_date: endDate,
        is_public: true,
      });

      // 2. Create the initial city stop
      await createStop(createdTrip.id, {
        cityId: Number(selectedCityId),
        startDate: startDate,
        endDate: endDate,
        orderIndex: 0,
      }).catch(() => {});

      // 3. Navigate to Itinerary Builder
      navigate(`/itinerary?tripId=${createdTrip.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create trip. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8 font-sans">
        {/* Top Back Link */}
        <button
          type="button"
          onClick={() => navigate('/trips')}
          className="inline-flex items-center gap-2 text-[#0F6E6E] font-bold text-sm hover:underline"
        >
          <ArrowLeft size={18} />
          Back to My Trips
        </button>

        {/* Form Container: Screen 4 "Plan a new trip" Form */}
        <Card className="p-6 sm:p-8 space-y-6">
          <div className="border-b border-gray-100 pb-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0F6E6E]/10 text-[#0F6E6E] text-xs font-bold uppercase tracking-wider mb-2">
              <Compass size={14} />
              Screen 4 — Trip Initialization
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Plan a new trip
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Select your primary destination, pick travel dates, and start assembling your multi-city schedule.
            </p>
          </div>

          {error && (
            <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-xs font-semibold text-red-700 flex items-center gap-2">
              <AlertCircle size={16} className="text-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
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
                    placeholder="e.g. European Odyssey, Summer in Goa"
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
                    <option value="">— Select a Destination Place —</option>
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

            {/* Form Submit Row */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate('/trips')}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-bold transition-colors"
              >
                Cancel
              </button>
              <Button
                variant="accent"
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 text-sm font-extrabold shadow-md"
              >
                {loading ? 'Creating Trip...' : 'Create Trip →'}
              </Button>
            </div>
          </form>
        </Card>

        {/* Suggestions Section: Screen 4 "Suggestion for Places to Visit/Activites to preform" */}
        <div className="space-y-5">
          <div className="flex items-center justify-between border-b border-gray-200 pb-3">
            <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
              <Sparkles size={20} className="text-[#FF7A59]" />
              Suggestion for Places to Visit / Activites to preform
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
      </div>
    </div>
  );
};

export default CreateTrip;