import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Copy,
  Share2,
  Compass,
  Globe
} from 'lucide-react';
import { fetchTrips, createTrip } from '../../api/trips.api';
import { Trip } from '../../types/trip';

export const PublicTripView: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [cloning, setCloning] = useState<boolean>(false);

  useEffect(() => {
    const loadPublicTrip = async () => {
      setLoading(true);
      try {
        const trips = await fetchTrips();
        const found = trips.find(
          (t) => t.share_slug === slug || String(t.id) === slug
        ) || trips[0];
        setTrip(found || null);
      } catch (err) {
        console.error('Failed to load shared trip:', err);
      } finally {
        setLoading(false);
      }
    };
    loadPublicTrip();
  }, [slug]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCloneTrip = async () => {
    if (!trip) return;
    setCloning(true);
    try {
      const cloned = await createTrip({
        name: `Copy of ${trip.name}`,
        description: trip.description,
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        cover_photo_url: trip.cover_photo_url,
        is_public: false,
      });
      navigate(`/trips/${cloned.id}/builder`);
    } catch (err) {
      console.error('Failed to clone trip:', err);
    } finally {
      setCloning(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] p-8 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#0F6E6E] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] p-8 flex items-center justify-center">
        <div className="bg-white rounded-3xl p-8 max-w-md text-center shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Trip Not Found</h2>
          <p className="text-gray-500 text-sm mb-6">This shared itinerary is no longer available.</p>
          <Link
            to="/explore"
            className="px-5 py-2.5 bg-[#0F6E6E] text-white rounded-xl font-medium text-sm inline-block"
          >
            Explore Destinations
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-16">
      {/* Public Cover Hero */}
      <div className="relative h-96 w-full bg-gray-900 overflow-hidden">
        <img
          src={trip.cover_photo_url || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1600&q=80'}
          alt={trip.name}
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>

        <div className="absolute top-6 left-4 sm:left-8 right-4 sm:right-8 flex items-center justify-between z-10">
          <Link
            to="/"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/20 backdrop-blur-md text-white hover:bg-white/30 text-sm font-medium transition-all"
          >
            <Compass size={16} />
            GlobeTrotter Home
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 backdrop-blur-md text-white hover:bg-white/30 text-sm font-medium transition-all"
            >
              <Share2 size={16} />
              {copied ? 'Link Copied!' : 'Share'}
            </button>

            <button
              onClick={handleCloneTrip}
              disabled={cloning}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#FF7A59] hover:bg-[#e66948] text-white text-sm font-bold shadow-md transition-all disabled:opacity-50"
            >
              <Copy size={16} />
              {cloning ? 'Copying...' : 'Copy to My Trips'}
            </button>
          </div>
        </div>

        <div className="absolute bottom-8 left-4 sm:left-8 right-4 sm:right-8 text-white max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-teal-200 text-xs font-semibold uppercase tracking-wider mb-3">
            <Globe size={13} />
            Community Shared Itinerary
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight drop-shadow-md">
            {trip.name}
          </h1>
          <p className="text-gray-200 text-sm sm:text-base mt-2 line-clamp-2">
            {trip.description}
          </p>
        </div>
      </div>

      {/* Main Itinerary Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-10">
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <div>
              <span className="text-xs text-gray-400 block font-semibold uppercase">Total Stops</span>
              <span className="font-bold text-gray-900 text-base">{trip.stops?.length || 0} Cities</span>
            </div>
            <div className="h-8 w-px bg-gray-200"></div>
            <div>
              <span className="text-xs text-gray-400 block font-semibold uppercase">Est. Budget</span>
              <span className="font-bold text-[#0F6E6E] text-base">
                ₹{(trip.estimated_cost || 32500).toLocaleString()}
              </span>
            </div>
          </div>

          <button
            onClick={handleCloneTrip}
            className="px-5 py-2.5 rounded-xl bg-[#0F6E6E] hover:bg-[#0c5959] text-white text-sm font-semibold shadow-sm transition-all"
          >
            Customize This Itinerary
          </button>
        </div>

        {/* Stops & Schedule */}
        <div className="space-y-8">
          {trip.stops && trip.stops.length > 0 ? (
            trip.stops.map((stop, idx) => (
              <div
                key={stop.id}
                className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
              >
                <div className="p-6 bg-gradient-to-r from-[#0F6E6E] to-[#134E4E] text-white flex items-center justify-between">
                  <div>
                    <span className="text-xs uppercase tracking-wider font-semibold text-teal-200">
                      Destination #{idx + 1}
                    </span>
                    <h2 className="text-2xl font-bold">{stop.city_name}</h2>
                    <p className="text-xs text-teal-100">{stop.country}</p>
                  </div>

                  <div className="text-xs bg-black/20 px-3 py-1.5 rounded-xl text-teal-100">
                    {stop.activities?.length || 0} planned activities
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {stop.activities?.map((act) => (
                      <div
                        key={act.id}
                        className="p-4 rounded-2xl bg-[#F9FAFB] border border-gray-100 flex gap-4"
                      >
                        {act.image_url && (
                          <img
                            src={act.image_url}
                            alt={act.name}
                            className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#0F6E6E]/10 text-[#0F6E6E]">
                            {act.category}
                          </span>
                          <h4 className="font-bold text-sm text-gray-900 mt-1 truncate">
                            {act.name}
                          </h4>
                          {act.notes && (
                            <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">
                              {act.notes}
                            </p>
                          )}
                          <div className="mt-2 text-xs font-bold text-[#0F6E6E]">
                            {act.cost === 0 ? 'Free' : `₹${act.cost.toLocaleString()}`}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-8">No stops added yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};
