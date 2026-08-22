import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Clock,
  Plus,
  Share2,
  Edit3,
  Trash2,
  ArrowLeft,
  Sparkles,
  Star
} from 'lucide-react';
import { getTripById, fetchTripBudget, removeActivityFromStop } from '../../api/trips.api';
import { Trip, TripBudgetSummary } from '../../types/trip';

export const ItineraryView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [budget, setBudget] = useState<TripBudgetSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'timeline' | 'budget'>('timeline');
  const [copied, setCopied] = useState<boolean>(false);

  const loadTripData = async () => {
    if (!id) return;
    try {
      const tripData = await getTripById(Number(id));
      setTrip(tripData);
      const budgetData = await fetchTripBudget(Number(id));
      setBudget(budgetData);
    } catch (err) {
      console.error('Failed to load trip itinerary:', err);
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
        const budgetData = await fetchTripBudget(Number(id));
        if (!ignore) {
          setTrip(tripData);
          setBudget(budgetData);
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to load trip itinerary:', err);
        if (!ignore) setLoading(false);
      }
    };
    load();
    return () => {
      ignore = true;
    };
  }, [id]);

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/trips/share/${trip?.share_slug || id}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleRemoveActivity = async (stopId: number, activityId: number) => {
    if (!trip) return;
    if (window.confirm('Remove this activity from your itinerary?')) {
      await removeActivityFromStop(trip.id, stopId, activityId);
      loadTripData();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#0F6E6E] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium text-sm">Loading complete itinerary...</p>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] p-8 flex items-center justify-center">
        <div className="bg-white rounded-3xl p-8 max-w-md text-center shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Trip Not Found</h2>
          <p className="text-gray-500 text-sm mb-6">The requested trip itinerary could not be found.</p>
          <button
            onClick={() => navigate('/trips')}
            className="px-5 py-2.5 bg-[#0F6E6E] text-white rounded-xl font-medium text-sm"
          >
            Back to Trips
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-16">
      {/* Hero Cover Banner */}
      <div className="relative h-80 w-full bg-gray-900 overflow-hidden">
        <img
          src={trip.cover_photo_url || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1600&q=80'}
          alt={trip.name}
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>

        <div className="absolute top-6 left-4 sm:left-8 right-4 sm:right-8 flex items-center justify-between z-10">
          <button
            onClick={() => navigate('/trips')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/20 backdrop-blur-md text-white hover:bg-white/30 text-sm font-medium transition-all"
          >
            <ArrowLeft size={16} />
            All Trips
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 backdrop-blur-md text-white hover:bg-white/30 text-sm font-medium transition-all"
            >
              <Share2 size={16} />
              {copied ? 'Link Copied!' : 'Share Trip'}
            </button>

            <Link
              to={`/trips/${trip.id}/builder`}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FF7A59] hover:bg-[#e66948] text-white text-sm font-medium shadow-sm transition-all"
            >
              <Edit3 size={16} />
              Edit Itinerary
            </Link>
          </div>
        </div>

        <div className="absolute bottom-6 left-4 sm:left-8 right-4 sm:right-8 text-white">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0F6E6E] text-xs font-semibold uppercase tracking-wider mb-2">
            <MapPin size={12} />
            {trip.stops?.length || 0} Cities Planned
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight drop-shadow-md">
            {trip.name}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-200 mt-2">
            <div className="flex items-center gap-1.5">
              <Calendar size={15} />
              <span>
                {new Date(trip.start_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} -{' '}
                {new Date(trip.end_date).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
            {trip.estimated_cost ? (
              <div className="flex items-center gap-1 font-semibold text-emerald-300">
                <span>Est. Cost: ₹{trip.estimated_cost.toLocaleString()}</span>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('timeline')}
              className={`pb-2 px-1 text-sm font-bold border-b-2 transition-all ${
                activeTab === 'timeline'
                  ? 'border-[#0F6E6E] text-[#0F6E6E]'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              Day-by-Day Itinerary
            </button>
            <button
              onClick={() => setActiveTab('budget')}
              className={`pb-2 px-1 text-sm font-bold border-b-2 transition-all ${
                activeTab === 'budget'
                  ? 'border-[#0F6E6E] text-[#0F6E6E]'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              Budget & Cost Breakdown
            </button>
          </div>

          <Link
            to={`/trips/${trip.id}/builder`}
            className="text-xs font-semibold text-[#0F6E6E] hover:underline flex items-center gap-1"
          >
            <Plus size={14} /> Add Stop / Activity
          </Link>
        </div>

        {activeTab === 'timeline' ? (
          <div className="space-y-10">
            {trip.stops && trip.stops.length > 0 ? (
              trip.stops.map((stop, stopIndex) => (
                <div
                  key={stop.id}
                  className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
                >
                  {/* Stop Header */}
                  <div className="bg-gradient-to-r from-teal-900/90 to-[#0F6E6E] p-6 text-white flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-teal-200 mb-1">
                        <span>Stop #{stopIndex + 1}</span>
                        <span>•</span>
                        <span>{stop.country}</span>
                      </div>
                      <h2 className="text-2xl font-bold flex items-center gap-2">
                        <MapPin size={22} className="text-[#FF7A59]" />
                        {stop.city_name}
                      </h2>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-medium text-teal-100">
                      <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-xl">
                        <Calendar size={14} />
                        <span>
                          {new Date(stop.start_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}{' '}
                          -{' '}
                          {new Date(stop.end_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      </div>

                      {stop.budget ? (
                        <div className="bg-black/20 px-3 py-1.5 rounded-xl">
                          Budget: ₹{stop.budget.toLocaleString()}
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {/* Activities List */}
                  <div className="p-6">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                      Planned Activities ({stop.activities?.length || 0})
                    </h3>

                    {stop.activities && stop.activities.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {stop.activities.map((activity) => (
                          <div
                            key={activity.id}
                            className="bg-[#F9FAFB] rounded-2xl p-4 border border-gray-100 hover:border-gray-200 transition-all flex gap-4"
                          >
                            {activity.image_url && (
                              <img
                                src={activity.image_url}
                                alt={activity.name}
                                className="w-24 h-24 rounded-xl object-cover flex-shrink-0"
                              />
                            )}

                            <div className="flex-1 flex flex-col justify-between">
                              <div>
                                <div className="flex items-start justify-between gap-2 mb-1">
                                  <h4 className="font-bold text-sm text-gray-900 leading-snug">
                                    {activity.name}
                                  </h4>
                                  <button
                                    onClick={() => handleRemoveActivity(stop.id, activity.id)}
                                    className="text-gray-400 hover:text-red-500 p-1 transition-colors"
                                    title="Remove activity"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>

                                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mb-2">
                                  <span className="px-2 py-0.5 rounded-md bg-[#0F6E6E]/10 text-[#0F6E6E] font-medium text-[11px]">
                                    {activity.category}
                                  </span>

                                  {activity.scheduled_time && (
                                    <span className="flex items-center gap-1 text-gray-500">
                                      <Clock size={11} /> {activity.scheduled_time}
                                    </span>
                                  )}

                                  {activity.rating && (
                                    <span className="flex items-center gap-1 text-amber-600 font-medium">
                                      <Star size={11} className="fill-amber-400 text-amber-400" />
                                      {activity.rating}
                                    </span>
                                  )}
                                </div>

                                {activity.notes && (
                                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                                    {activity.notes}
                                  </p>
                                )}
                              </div>

                              <div className="pt-2 border-t border-gray-200/60 mt-2 flex items-center justify-between text-xs">
                                <span className="text-gray-500">
                                  {activity.duration_hours ? `${activity.duration_hours} hrs` : 'Flexible'}
                                </span>
                                <span className="font-bold text-[#0F6E6E]">
                                  {activity.cost === 0 ? 'Free' : `₹${activity.cost.toLocaleString()}`}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        <p className="text-sm text-gray-500 mb-3">No activities added for this stop yet.</p>
                        <Link
                          to={`/trips/${trip.id}/builder`}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF7A59] hover:underline"
                        >
                          <Plus size={14} /> Add activities in Itinerary Builder
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm max-w-xl mx-auto">
                <Sparkles size={36} className="text-[#FF7A59] mx-auto mb-3" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Stops in Itinerary</h3>
                <p className="text-gray-500 text-sm mb-6">
                  Add your first destination stop and schedule exciting experiences for each day!
                </p>
                <Link
                  to={`/trips/${trip.id}/builder`}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#FF7A59] hover:bg-[#e66948] text-white font-medium text-sm shadow-sm transition-all"
                >
                  <Plus size={18} />
                  Open Itinerary Builder
                </Link>
              </div>
            )}
          </div>
        ) : (
          /* Budget Tab View */
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Trip Cost Breakdown & Budget</h2>

            {budget ? (
              <div className="space-y-8">
                {/* Metric Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-5">
                    <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                      Total Estimated Cost
                    </span>
                    <div className="text-3xl font-extrabold text-emerald-900 mt-2">
                      ₹{budget.totalSpent.toLocaleString()}
                    </div>
                    <span className="text-xs text-emerald-700 mt-1 block">Based on scheduled activities & stays</span>
                  </div>

                  <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-5">
                    <span className="text-xs font-semibold text-blue-800 uppercase tracking-wider">
                      Trip Budget Target
                    </span>
                    <div className="text-3xl font-extrabold text-blue-900 mt-2">
                      ₹{budget.totalBudget.toLocaleString()}
                    </div>
                    <span className="text-xs text-blue-700 mt-1 block">
                      Remaining: ₹{Math.max(0, budget.totalBudget - budget.totalSpent).toLocaleString()}
                    </span>
                  </div>

                  <div className="bg-amber-50/60 border border-amber-100 rounded-2xl p-5">
                    <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">
                      Daily Average Spend
                    </span>
                    <div className="text-3xl font-extrabold text-amber-900 mt-2">
                      ₹{budget.dailyAverage.toLocaleString()}
                    </div>
                    <span className="text-xs text-amber-700 mt-1 block">Approx. per day of travel</span>
                  </div>
                </div>

                {/* Categories Table */}
                <div className="border border-gray-100 rounded-2xl overflow-hidden">
                  <div className="bg-gray-50 px-6 py-3 font-semibold text-xs text-gray-500 uppercase tracking-wider">
                    Category Breakdown
                  </div>
                  <div className="divide-y divide-gray-100">
                    {budget.categories.map((cat, idx) => (
                      <div key={idx} className="px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }}></span>
                          <span className="font-semibold text-sm text-gray-900">{cat.category}</span>
                        </div>
                        <span className="font-bold text-sm text-gray-900">₹{cat.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};
