import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Plus,
  Loader2,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { aiApi, AIPlanResponse } from '../../api/ai.api';
import { createTrip, addStopToTrip, addActivityToStop } from '../../api/trips.api';

const QUICK_PROMPTS = [
  { label: '🏖️ 3-Day Goa Budget Trip', city: 'Goa', message: 'Plan a relaxing 3-day budget beach trip to Goa under ₹10,000 with seafood and sunsets' },
  { label: '🗼 Paris Art & Bakeries', city: 'Paris', message: 'Create a 2-day cultural and culinary tour of Paris visiting top museums and cafes' },
  { label: '⛩️ Tokyo Neon & Shrines', city: 'Tokyo', message: 'Design a 2-day modern and traditional trip to Tokyo with street food and temples' },
  { label: '🏰 Jaipur Royal Heritage', city: 'Jaipur', message: 'Plan a 2-day historical sightseeing trip to Jaipur exploring royal palaces and forts' },
];

export const AIChatPage: React.FC = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [city, setCity] = useState('');
  const [budget, setBudget] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [plan, setPlan] = useState<AIPlanResponse | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleGenerate = async (customMsg?: string, customCity?: string) => {
    const promptText = customMsg || message;
    if (!promptText.trim()) return;

    setLoading(true);
    setSuccessMessage(null);
    try {
      const result = await aiApi.planTrip({
        message: promptText.trim(),
        city: customCity || city.trim() || undefined,
        budget: budget ? Number(budget) : undefined,
      });
      setPlan(result);
    } catch (err: any) {
      console.error('Failed to generate AI trip plan:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyToTrip = async () => {
    if (!plan || plan.days.length === 0) return;
    setApplying(true);
    try {
      const primaryCity = plan.days[0]?.city || 'Dream Trip';
      const today = new Date();
      const startDate = today.toISOString().split('T')[0];
      const endDate = new Date(today.getTime() + plan.days.length * 86400000).toISOString().split('T')[0];

      // 1. Create trip in PostgreSQL
      const createdTrip = await createTrip({
        name: `AI Planned: ${primaryCity} Journey`,
        description: `Custom automated itinerary crafted by GlobeTrotter AI Assistant. Total estimated budget: ₹${plan.total_estimated_cost.toLocaleString()}.`,
        start_date: startDate,
        end_date: endDate,
        cover_photo_url: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80',
        is_public: true,
      });

      // 2. Add stops and activities sequentially
      for (const day of plan.days) {
        const stop = await addStopToTrip(createdTrip.id, {
          city_name: day.city,
          country: 'Global',
          start_date: startDate,
          end_date: endDate,
          budget: Math.round(plan.total_estimated_cost / plan.days.length),
        });

        for (const act of day.activities) {
          await addActivityToStop(createdTrip.id, stop.id, {
            name: act.name,
            category: act.category,
            cost: act.estimated_cost,
            duration_hours: act.duration_hours || 2,
            scheduled_time: act.scheduled_time || '10:00 AM',
            notes: act.notes || 'AI-recommended experience',
          });
        }
      }

      setSuccessMessage(`Trip "${createdTrip.name}" successfully created and saved to database!`);
      setTimeout(() => {
        navigate(`/trips/${createdTrip.id}`);
      }, 1500);
    } catch (err: any) {
      console.error('Failed to apply AI plan to trip:', err);
      alert('Failed to save AI itinerary into trip database.');
    } finally {
      setApplying(false);
    }
  };

  const getCategoryColor = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'adventure': return '#FF7A59';
      case 'food': return '#F5A623';
      case 'culture': return '#2B8A8A';
      case 'nightlife': return '#8B5CF6';
      default: return '#0F6E6E';
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-20">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-[#0B4F4F] to-[#0F6E6E] text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-teal-100 text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles size={14} className="text-[#FF7A59]" />
            AI Travel Architect (Llama-3.3 + Groq / Fallback Engine)
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            AI Trip Planning Assistant
          </h1>
          <p className="text-teal-100 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
            Describe your dream trip in plain language. Our AI will automatically construct a customized day-wise schedule, estimate costs, and add it directly into your live trips.
          </p>

          {/* Quick Prompts */}
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="text-xs text-teal-200 self-center font-semibold mr-1">Quick Ideas:</span>
            {QUICK_PROMPTS.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setMessage(p.message);
                  setCity(p.city);
                  handleGenerate(p.message, p.city);
                }}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-md border border-white/10 transition-all cursor-pointer"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Input Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm mb-8">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleGenerate();
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                What kind of trip do you want to plan?
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Plan a 3-day romantic and cultural trip to Paris under ₹25,000 with bakery tours and river cruises..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full p-4 rounded-2xl border border-gray-200 focus:border-[#0F6E6E] focus:ring-2 focus:ring-[#0F6E6E]/20 text-sm text-gray-900 outline-none transition-all"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Target City (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Goa, Paris, Tokyo, Jaipur"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 outline-none focus:border-[#0F6E6E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Max Budget (₹ INR - Optional)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 15000"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 outline-none focus:border-[#0F6E6E]"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={loading || !message.trim()}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#FF7A59] hover:bg-[#e66948] disabled:opacity-50 text-white text-sm font-bold shadow-sm transition-all transform hover:-translate-y-0.5 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Generating AI Itinerary...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    Generate Itinerary
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center gap-2 animate-fade-in">
            <CheckCircle2 size={18} className="text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* AI Output Plan */}
        {plan && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-[#0F6E6E] uppercase tracking-wider block">
                  AI Generated Itinerary Preview
                </span>
                <h2 className="text-2xl font-black text-gray-900 mt-0.5">
                  {plan.days.length}-Day Personalized Travel Plan
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Total Estimated Budget: <span className="font-bold text-gray-900">₹{plan.total_estimated_cost.toLocaleString()}</span>
                </p>
              </div>

              <button
                onClick={handleApplyToTrip}
                disabled={applying}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0F6E6E] hover:bg-[#0A4F4F] disabled:opacity-50 text-white text-sm font-bold shadow-md transition-all cursor-pointer"
              >
                {applying ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Saving into PostgreSQL...
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    Save & Open in Builder →
                  </>
                )}
              </button>
            </div>

            {/* Days Breakdown */}
            <div className="space-y-6">
              {plan.days.map((dayPlan) => (
                <div
                  key={dayPlan.day}
                  className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm"
                >
                  <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-[#0F6E6E]/10 text-[#0F6E6E] font-black text-base flex items-center justify-center">
                        D{dayPlan.day}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Day {dayPlan.day}: {dayPlan.city}</h3>
                        <span className="text-xs text-gray-400 font-medium">
                          {dayPlan.activities.length} curated activities
                        </span>
                      </div>
                    </div>

                    <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold">
                      ₹{dayPlan.activities.reduce((sum, a) => sum + (a.estimated_cost || 0), 0).toLocaleString()} Day Total
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {dayPlan.activities.map((act, i) => (
                      <div
                        key={i}
                        className="bg-gray-50/80 rounded-2xl p-4 border border-gray-100 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span
                              className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md text-white"
                              style={{ backgroundColor: getCategoryColor(act.category) }}
                            >
                              {act.category}
                            </span>
                            <span className="text-xs font-bold text-gray-900">
                              {act.estimated_cost === 0 ? 'Free' : `₹${act.estimated_cost.toLocaleString()}`}
                            </span>
                          </div>

                          <h4 className="font-bold text-sm text-gray-900 mb-1 leading-snug">
                            {act.name}
                          </h4>
                          {act.notes && (
                            <p className="text-xs text-gray-500 line-clamp-2 mb-3">
                              {act.notes}
                            </p>
                          )}
                        </div>

                        <div className="pt-2 border-t border-gray-200/60 flex items-center justify-between text-[11px] text-gray-400">
                          <span className="flex items-center gap-1">
                            <Clock size={12} /> {act.scheduled_time || 'Flexible'}
                          </span>
                          <span>{act.duration_hours || 2} hrs</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIChatPage;
