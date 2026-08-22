import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import ItineraryNav from '../../components/ItineraryNav';
import { getStops } from '../../api/itinerary.api';

interface DayItem {
  date: string;
  cityName: string;
  cityCountry?: string;
  activity: string;
  category: string | null;
  cost: number;
}

function getErrorMessage(e: unknown): string {
  if (typeof e === 'object' && e !== null && 'response' in e) {
    const res = (e as { response?: { data?: { error?: string } } }).response;
    if (res?.data?.error) return res.data.error;
  }
  if (e instanceof Error) return e.message;
  return 'Failed to load timeline';
}

export default function CalendarTimeline() {
  const { tripId } = useParams();
  const id = Number(tripId);
  const [items, setItems] = useState<DayItem[]>([]);
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (!id) return;

    getStops(id)
      .then((stops) => {
        if (!active) return;
        const flat: DayItem[] = [];
        for (const stop of stops) {
          const baseDate = stop.startDate ?? '';
          const cityName = stop.city?.name || 'City Stop';
          const cityCountry = stop.city?.country;
          for (const a of stop.activities ?? []) {
            flat.push({
              date: a.scheduledDate ?? baseDate,
              cityName,
              cityCountry,
              activity: a.activity?.name ?? a.customName ?? 'Activity',
              category: a.activity?.category ?? null,
              cost: a.customCost || a.activity?.cost || 0,
            });
          }
        }
        flat.sort((x, y) => (x.date || 'zzz').localeCompare(y.date || 'zzz'));
        setItems(flat);
        setLoading(false);
      })
      .catch((e: unknown) => {
        if (active) {
          setError(getErrorMessage(e));
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [id]);

  if (loading) return <LoadingSpinner label="Loading timeline…" />;
  if (error)
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <EmptyState title="Trip Not Found" description="The requested trip was not found or has been updated." />
        <div className="mt-6 text-center">
          <Link to="/itinerary">
            <Button variant="primary">Return to Itinerary Builder →</Button>
          </Link>
        </div>
      </div>
    );

  if (items.length === 0)
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <ItineraryNav tripId={id} />
        <EmptyState
          title="Nothing scheduled yet"
          description="Add activities to your itinerary stops to visualize them on the timeline."
        />
        <div className="mt-4 text-center">
          <Link to={`/itinerary?tripId=${id}`}>
            <Button variant="accent">Go to Builder</Button>
          </Link>
        </div>
      </div>
    );

  const totalCost = items.reduce((sum, item) => sum + item.cost, 0);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <ItineraryNav tripId={id} totalBudget={totalCost} />

      <ol className="relative border-l-2 border-primary/30 ml-4 pl-6 space-y-6">
        {items.map((it, i) => (
          <li key={i} className="relative">
            <span className="absolute -left-[31px] top-1.5 h-4 w-4 rounded-full border-2 border-surface bg-primary shadow-sm" />
            <Card className="hover:shadow-card hover:border-primary/40 transition-all">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-2.5 mb-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-primary">{it.date || 'Unscheduled'}</span>
                  <Badge tone="neutral">
                    {it.cityName} {it.cityCountry ? `(${it.cityCountry})` : ''}
                  </Badge>
                </div>
                <span className="text-sm font-extrabold text-accent">${it.cost.toFixed(2)}</span>
              </div>
              <p className="text-base font-semibold text-primary">{it.activity}</p>
              {it.category && (
                <div className="mt-2.5">
                  <Badge tone="accent" className="capitalize">
                    {it.category}
                  </Badge>
                </div>
              )}
            </Card>
          </li>
        ))}
      </ol>
    </div>
  );
}
