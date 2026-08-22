import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Plus,
  Trash2,
  ArrowLeft,
  CheckCircle2,
  Compass,
  Sparkles,
  Eye,
  AlertCircle
} from 'lucide-react';
import {
  getTripById,
  addStopToTrip,
  deleteStopFromTrip,
  addActivityToStop,
  removeActivityFromStop
} from '../../api/trips.api';
import { Trip } from '../../types/trip';

export const ItineraryBuilder: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedStopId, setSelectedStopId] = useState<number | null>(null);

  // Stop Modal / Form State
  const [showAddStopModal, setShowAddStopModal] = useState<boolean>(false);
  const [stopCity, setStopCity] = useState<string>('');
  const [stopCountry, setStopCountry] = useState<string>('India');
  const [stopStartDate, setStopStartDate] = useState<string>('');
  const [stopEndDate, setStopEndDate] = useState<string>('');
  const [stopBudget, setStopBudget] = useState<string>('15000');
  const [stopImageUrl, setStopImageUrl] = useState<string>('');

  // Activity Modal / Form State
  const [showAddActivityModal, setShowAddActivityModal] = useState<boolean>(false);
  const [activityName, setActivityName] = useState<string>('');
  const [activityCategory, setActivityCategory] = useState<string>('Sightseeing');
  const [activityCost, setActivityCost] = useState<string>('500');
  const [activityDuration, setActivityDuration] = useState<string>('2');
  const [activityTime, setActivityTime] = useState<string>('10:00 AM');
  const [activityDay, setActivityDay] = useState<string>('1');
  const [activityNotes, setActivityNotes] = useState<string>('');
  const [activityImageUrl, setActivityImageUrl] = useState<string>('');

  // Modal Error states
  const [stopError, setStopError] = useState<string>('');
  const [activityError, setActivityError] = useState<string>('');

  const loadTrip = async () => {
    if (!id) return;
    try {
      const tripData = await getTripById(Number(id));
      setTrip(tripData);
      if (tripData?.stops && tripData.stops.length > 0 && !selectedStopId) {
        setSelectedStopId(tripData.stops[0].id);
      }
    } catch (err) {
      console.error('Failed to load trip:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      if (!id) return;
      try {
        const tripData = await getTripById(Number(id));
        if (!ignore) {
          setTrip(tripData);
          if (tripData?.stops && tripData.stops.length > 0) {
            setSelectedStopId(tripData.stops[0].id);
          }
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to load trip:', err);
        if (!ignore) setLoading(false);
      }
    };
    load();
    return () => {
      ignore = true;
    };
  }, [id]);

  const handleCreateStop = async (e: React.FormEvent) => {
    e.preventDefault();
    setStopError('');

    if (!trip) return;

    const trimmedCity = stopCity.trim();
    if (!trimmedCity || trimmedCity.length < 2) {
      setStopError('Please enter a valid destination/city name (at least 2 characters).');
      return;
    }

    if (stopStartDate && stopEndDate && stopEndDate < stopStartDate) {
      setStopError('Stop end date cannot be earlier than stop start date.');
      return;
    }

    const budgetVal = Number(stopBudget);
    if (isNaN(budgetVal) || budgetVal < 0) {
      setStopError('Budget must be a non-negative number.');
      return;
    }

    if (stopImageUrl.trim()) {
      const urlPattern = /^(https?:\/\/).+/i;
      if (!urlPattern.test(stopImageUrl.trim())) {
        setStopError('Cover photo must be a valid URL starting with http:// or https://');
        return;
      }
    }

    await addStopToTrip(trip.id, {
      city_name: trimmedCity,
      country: stopCountry.trim() || 'India',
      start_date: stopStartDate || trip.start_date,
      end_date: stopEndDate || trip.end_date,
      budget: budgetVal || 0,
      image_url:
        stopImageUrl.trim() ||
        'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80',
    });

    setShowAddStopModal(false);
    setStopCity('');
    setStopStartDate('');
    setStopEndDate('');
    setStopImageUrl('');
    setStopError('');
    await loadTrip();
  };

  const handleDeleteStop = async (stopId: number) => {
    if (!trip) return;
    if (window.confirm('Are you sure you want to delete this city stop and its scheduled activities?')) {
      await deleteStopFromTrip(trip.id, stopId);
      await loadTrip();
    }
  };

  const handleCreateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    setActivityError('');

    if (!trip || !selectedStopId) return;

    const trimmedName = activityName.trim();
    if (!trimmedName || trimmedName.length < 2) {
      setActivityError('Activity name is required (at least 2 characters).');
      return;
    }

    const costVal = Number(activityCost);
    if (isNaN(costVal) || costVal < 0) {
      setActivityError('Cost must be a valid non-negative number.');
      return;
    }

    const durationVal = Number(activityDuration);
    if (isNaN(durationVal) || durationVal <= 0 || durationVal > 24) {
      setActivityError('Duration must be between 0.5 and 24 hours.');
      return;
    }

    const dayVal = Number(activityDay);
    if (isNaN(dayVal) || dayVal < 1) {
      setActivityError('Day number must be at least 1.');
      return;
    }

    if (activityImageUrl.trim()) {
      const urlPattern = /^(https?:\/\/).+/i;
      if (!urlPattern.test(activityImageUrl.trim())) {
        setActivityError('Activity image must be a valid URL starting with http:// or https://');
        return;
      }
    }

    await addActivityToStop(trip.id, selectedStopId, {
      name: trimmedName,
      category: activityCategory,
      cost: costVal,
      duration_hours: durationVal,
      scheduled_time: activityTime.trim() || 'Flexible',
      day_number: dayVal,
      notes: activityNotes.trim(),
      image_url:
        activityImageUrl.trim() ||
        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80',
    });

    setShowAddActivityModal(false);
    setActivityName('');
    setActivityNotes('');
    setActivityImageUrl('');
    setActivityError('');
    await loadTrip();
  };


  const handleRemoveActivity = async (stopId: number, activityId: number) => {
    if (!trip) return;
    await removeActivityFromStop(trip.id, stopId, activityId);
    await loadTrip();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#0F6E6E] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium text-sm">Opening Itinerary Builder...</p>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] p-8 flex items-center justify-center">
        <div className="bg-white rounded-3xl p-8 max-w-md text-center shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Trip Not Found</h2>
          <p className="text-gray-500 text-sm mb-6">The requested trip could not be loaded.</p>
          <button
            onClick={() => navigate('/trips')}
            className="px-5 py-2.5 bg-[#0F6E6E] text-white rounded-xl font-medium text-sm"
          >
            Back to My Trips
          </button>
        </div>
      </div>
    );
  }

  const selectedStop = trip.stops?.find((s) => s.id === selectedStopId) || trip.stops?.[0];

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col">
      {/* Top Builder Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/trips')}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#0F6E6E]">
              Itinerary Builder
            </span>
            <h1 className="text-lg font-bold text-gray-900 leading-none mt-0.5">
              {trip.name}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/trips/${trip.id}`)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium transition-colors"
          >
            <Eye size={16} />
            Preview Itinerary
          </button>

          <button
            onClick={() => navigate(`/trips/${trip.id}`)}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#0F6E6E] hover:bg-[#0c5959] text-white text-sm font-medium shadow-sm transition-colors"
          >
            <CheckCircle2 size={16} />
            Done Planning
          </button>
        </div>
      </div>

      {/* Builder Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Stops Timeline & Manager */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <MapPin size={18} className="text-[#FF7A59]" />
              City Stops ({trip.stops?.length || 0})
            </h2>
            <button
              onClick={() => setShowAddStopModal(true)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#FF7A59] hover:bg-[#e66948] text-white text-xs font-medium shadow-sm transition-colors"
            >
              <Plus size={14} /> Add City Stop
            </button>
          </div>

          {/* Stops List */}
          <div className="space-y-3">
            {trip.stops && trip.stops.length > 0 ? (
              trip.stops.map((stop, index) => {
                const isSelected = selectedStop?.id === stop.id;
                return (
                  <div
                    key={stop.id}
                    onClick={() => setSelectedStopId(stop.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#0F6E6E]/5 border-[#0F6E6E] shadow-sm ring-1 ring-[#0F6E6E]'
                        : 'bg-white border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[11px] font-bold text-[#0F6E6E] uppercase tracking-wider">
                          Stop {index + 1}
                        </span>
                        <h3 className="font-bold text-base text-gray-900">{stop.city_name}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">{stop.country}</p>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteStop(stop.id);
                        }}
                        className="text-gray-400 hover:text-red-500 p-1 transition-colors"
                        title="Delete stop"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                      <span>{stop.activities?.length || 0} activities</span>
                      <span className="font-medium text-gray-700">
                        {new Date(stop.start_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 bg-white rounded-2xl border border-dashed border-gray-200 text-center">
                <Compass size={32} className="text-gray-400 mx-auto mb-2" />
                <p className="text-xs text-gray-500 mb-3">No city stops in this trip yet.</p>
                <button
                  onClick={() => setShowAddStopModal(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0F6E6E] text-white text-xs font-semibold"
                >
                  <Plus size={14} /> Add First Stop
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Activities for the selected stop */}
        <div className="lg:col-span-8 space-y-6">
          {selectedStop ? (
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-gray-100 gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#0F6E6E] uppercase tracking-wider mb-1">
                    <span>Active Stop</span>
                    <span>•</span>
                    <span>{selectedStop.country}</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    {selectedStop.city_name}
                  </h2>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                    <Calendar size={13} />
                    <span>
                      {new Date(selectedStop.start_date).toLocaleDateString()} -{' '}
                      {new Date(selectedStop.end_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setShowAddActivityModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FF7A59] hover:bg-[#e66948] text-white text-sm font-medium shadow-sm transition-colors"
                >
                  <Plus size={16} />
                  Add Activity
                </button>
              </div>

              {/* Activities Grid */}
              <div className="pt-6">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                  Scheduled Experiences ({selectedStop.activities?.length || 0})
                </h3>

                {selectedStop.activities && selectedStop.activities.length > 0 ? (
                  <div className="space-y-3">
                    {selectedStop.activities.map((act) => (
                      <div
                        key={act.id}
                        className="p-4 rounded-2xl bg-[#F9FAFB] border border-gray-100 hover:border-gray-200 transition-all flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          {act.image_url && (
                            <img
                              src={act.image_url}
                              alt={act.name}
                              className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                            />
                          )}
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded-md bg-[#0F6E6E]/10 text-[#0F6E6E] text-[11px] font-semibold">
                                {act.category}
                              </span>
                              {act.day_number && (
                                <span className="text-[11px] text-gray-500 font-medium">
                                  Day {act.day_number}
                                </span>
                              )}
                            </div>
                            <h4 className="font-bold text-sm text-gray-900 truncate mt-1">
                              {act.name}
                            </h4>
                            {act.notes && (
                              <p className="text-xs text-gray-500 truncate mt-0.5">
                                {act.notes}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-4 flex-shrink-0">
                          <div className="text-right">
                            <div className="font-bold text-sm text-[#0F6E6E]">
                              {act.cost === 0 ? 'Free' : `₹${act.cost.toLocaleString()}`}
                            </div>
                            <div className="text-[11px] text-gray-400">
                              {act.scheduled_time || 'Flexible'}
                            </div>
                          </div>

                          <button
                            onClick={() => handleRemoveActivity(selectedStop.id, act.id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 border border-dashed border-gray-200 rounded-2xl">
                    <Sparkles size={32} className="text-[#FF7A59] mx-auto mb-2" />
                    <h4 className="font-bold text-sm text-gray-900 mb-1">No activities added yet</h4>
                    <p className="text-xs text-gray-500 mb-4">
                      Add tours, sightseeing, culinary dinners, and outdoor adventures to this stop.
                    </p>
                    <button
                      onClick={() => setShowAddActivityModal(true)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#FF7A59] text-white rounded-xl text-xs font-semibold shadow-sm"
                    >
                      <Plus size={14} /> Add First Activity
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-2">Select or Add a Stop</h3>
              <p className="text-xs text-gray-500 mb-4">
                Choose a city stop on the left or add a new stop to start organizing activities.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add Stop Modal */}
      {showAddStopModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-xl border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Add Destination Stop</h2>
            <p className="text-xs text-gray-500 mb-4">
              Include another city or location in this travel itinerary.
            </p>

            {stopError && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 flex items-start gap-2">
                <AlertCircle size={15} className="text-red-500 flex-shrink-0 mt-0.5" />
                <span>{stopError}</span>
              </div>
            )}

            <form onSubmit={handleCreateStop} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  City / Destination Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kyoto, Jaipur, Barcelona"
                  value={stopCity}
                  onChange={(e) => setStopCity(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#0F6E6E] focus:ring-1 focus:ring-[#0F6E6E] outline-none text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Country</label>
                  <input
                    type="text"
                    value={stopCountry}
                    onChange={(e) => setStopCountry(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#0F6E6E] focus:ring-1 focus:ring-[#0F6E6E] outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Stop Budget (₹)</label>
                  <input
                    type="number"
                    value={stopBudget}
                    onChange={(e) => setStopBudget(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#0F6E6E] focus:ring-1 focus:ring-[#0F6E6E] outline-none text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={stopStartDate}
                    onChange={(e) => setStopStartDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#0F6E6E] focus:ring-1 focus:ring-[#0F6E6E] outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={stopEndDate}
                    onChange={(e) => setStopEndDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#0F6E6E] focus:ring-1 focus:ring-[#0F6E6E] outline-none text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Cover Photo URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={stopImageUrl}
                  onChange={(e) => setStopImageUrl(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#0F6E6E] focus:ring-1 focus:ring-[#0F6E6E] outline-none text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddStopModal(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0F6E6E] hover:bg-[#0c5959] text-white text-sm font-semibold shadow-sm transition-colors"
                >
                  Add Stop
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Activity Modal */}
      {showAddActivityModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-xl border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Add Activity to {selectedStop?.city_name}</h2>
            <p className="text-xs text-gray-500 mb-4">
              Schedule sightseeing, dining, tours, or adventure.
            </p>

            {activityError && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 flex items-start gap-2">
                <AlertCircle size={15} className="text-red-500 flex-shrink-0 mt-0.5" />
                <span>{activityError}</span>
              </div>
            )}

            <form onSubmit={handleCreateActivity} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Activity Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Scuba diving, Sunset Cruise, Museum visit"
                  value={activityName}
                  onChange={(e) => setActivityName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#0F6E6E] focus:ring-1 focus:ring-[#0F6E6E] outline-none text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
                  <select
                    value={activityCategory}
                    onChange={(e) => setActivityCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#0F6E6E] focus:ring-1 focus:ring-[#0F6E6E] outline-none text-sm bg-white"
                  >
                    <option value="Sightseeing">Sightseeing</option>
                    <option value="Adventure">Adventure</option>
                    <option value="Food & Dining">Food & Dining</option>
                    <option value="Culture">Culture</option>
                    <option value="Nature">Nature</option>
                    <option value="Nightlife">Nightlife</option>
                    <option value="Shopping">Shopping</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Cost (₹)</label>
                  <input
                    type="number"
                    value={activityCost}
                    onChange={(e) => setActivityCost(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#0F6E6E] focus:ring-1 focus:ring-[#0F6E6E] outline-none text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Day #</label>
                  <input
                    type="number"
                    min="1"
                    value={activityDay}
                    onChange={(e) => setActivityDay(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Time</label>
                  <input
                    type="text"
                    placeholder="10:00 AM"
                    value={activityTime}
                    onChange={(e) => setActivityTime(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Duration (hrs)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={activityDuration}
                    onChange={(e) => setActivityDuration(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Notes & Details
                </label>
                <textarea
                  rows={2}
                  placeholder="Ticket details, booking ref, or tips..."
                  value={activityNotes}
                  onChange={(e) => setActivityNotes(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#0F6E6E] focus:ring-1 focus:ring-[#0F6E6E] outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Image URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={activityImageUrl}
                  onChange={(e) => setActivityImageUrl(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#0F6E6E] focus:ring-1 focus:ring-[#0F6E6E] outline-none text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddActivityModal(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#FF7A59] hover:bg-[#e66948] text-white text-sm font-semibold shadow-sm transition-colors"
                >
                  Add Activity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
