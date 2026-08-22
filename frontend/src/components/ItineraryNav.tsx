import { Link, useLocation } from 'react-router-dom';
import { Calendar, LayoutList, Sliders, ExternalLink, Share2, Check } from 'lucide-react';
import { useState } from 'react';

interface ItineraryNavProps {
  tripId: number | null;
  shareSlug?: string | null;
  tripName?: string;
  totalBudget?: number;
}

export default function ItineraryNav({ tripId, shareSlug, tripName, totalBudget }: ItineraryNavProps) {
  const location = useLocation();
  const [copied, setCopied] = useState(false);

  const isBuilder = location.pathname === '/itinerary' || location.pathname === '/';
  const isView = location.pathname.endsWith('/view');
  const isCalendar = location.pathname.endsWith('/calendar');

  const copyLink = () => {
    if (!shareSlug) return;
    const url = `${window.location.origin}/itinerary/public/${shareSlug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="mb-6 rounded-2xl border border-border bg-surface p-4 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-3.5 mb-3.5">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">GlobeTrotter — Itinerary & Sharing</span>
          {tripName && (
            <h2 className="text-xl font-extrabold text-primary flex items-center gap-2.5 mt-0.5">
              {tripName}
              {totalBudget !== undefined && totalBudget > 0 && (
                <span className="rounded-full bg-accent/15 px-3 py-0.5 text-xs font-bold text-accent-dark">
                  ${totalBudget.toFixed(2)} Total Budget
                </span>
              )}
            </h2>
          )}
        </div>

        {shareSlug && (
          <div className="flex items-center gap-2">
            <Link to={`/itinerary/public/${shareSlug}`} target="_blank">
              <button className="flex items-center gap-1.5 rounded-xl bg-primary/10 border border-primary/20 px-3.5 py-1.5 text-xs font-bold text-primary hover:bg-primary/20 transition-all">
                <ExternalLink className="h-3.5 w-3.5" />
                Public View
              </button>
            </Link>
            <button
              onClick={copyLink}
              className="flex items-center gap-1.5 rounded-xl bg-accent px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-accent-dark transition-all"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Share2 className="h-3.5 w-3.5" />}
              {copied ? 'Link Copied!' : 'Share Public Link'}
            </button>
          </div>
        )}
      </div>

      <nav className="flex items-center gap-2.5 overflow-x-auto">
        <Link
          to={tripId ? `/itinerary?tripId=${tripId}` : '/itinerary'}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all ${
            isBuilder
              ? 'bg-primary text-white shadow-md shadow-primary/20'
              : 'bg-primary/10 text-primary hover:bg-primary/20'
          }`}
        >
          <Sliders className="h-4 w-4" />
          Builder & Stops
        </Link>

        {tripId && (
          <>
            <Link
              to={`/itinerary/${tripId}/view`}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all ${
                isView
                  ? 'bg-primary text-white shadow-md shadow-primary/20'
                  : 'bg-primary/10 text-primary hover:bg-primary/20'
              }`}
            >
              <LayoutList className="h-4 w-4" />
              Structured View
            </Link>

            <Link
              to={`/itinerary/${tripId}/calendar`}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all ${
                isCalendar
                  ? 'bg-primary text-white shadow-md shadow-primary/20'
                  : 'bg-primary/10 text-primary hover:bg-primary/20'
              }`}
            >
              <Calendar className="h-4 w-4" />
              Timeline & Calendar
            </Link>
          </>
        )}
      </nav>
    </div>
  );
}
