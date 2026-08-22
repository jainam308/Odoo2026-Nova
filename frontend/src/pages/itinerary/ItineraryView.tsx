import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import ItineraryNav from '../../components/ItineraryNav';
import { getStops, getBudgetSummary, type Stop, type BudgetSummary } from '../../api/itinerary.api';

function getErrorMessage(e: unknown): string {
  if (typeof e === 'object' && e !== null && 'response' in e) {
    const res = (e as { response?: { data?: { error?: string } } }).response;
    if (res?.data?.error) return res.data.error;
  }
  if (e instanceof Error) return e.message;
  return 'Failed to load itinerary';
}

export default function ItineraryView() {
  const { tripId } = useParams();
  const id = Number(tripId);
  const [stops, setStops] = useState<Stop[]>([]);
  const [budget, setBudget] = useState<BudgetSummary | null>(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (!id) return;

    Promise.all([getStops(id), getBudgetSummary(id)])
      .then(([s, b]) => {
        if (active) {
          setStops(s);
          setBudget(b);
          setLoading(false);
        }
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

  if (loading) return <LoadingSpinner label="Loading itinerary breakdown…" />;
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

  if (stops.length === 0)
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <ItineraryNav tripId={id} />
        <EmptyState
          title="This trip has no stops yet"
          description="Add stops and activities in the Itinerary Builder."
        />
        <div className="mt-4 text-center">
          <Link to={`/itinerary?tripId=${id}`}>
            <Button variant="accent">Go to Builder</Button>
          </Link>
        </div>
      </div>
    );

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <ItineraryNav tripId={id} totalBudget={budget?.total} />

      {budget && (
        <Card className="mb-6 border-l-4 border-l-primary">
          <div className="flex flex-wrap justify-between items-start gap-4">
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-muted">Estimated Total Cost</p>
              <p className="text-3xl font-extrabold text-primary">${budget.total.toFixed(2)}</p>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium text-muted">Category Breakdown:</span>
              <div className="flex flex-wrap gap-2">
                {Object.entries(budget.byCategory).map(([cat, amt]) => (
                  <Badge key={cat} tone="accent" className="capitalize">
                    {cat}: ${amt.toFixed(2)}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          {Object.keys(budget.byDay).length > 0 && (
            <div className="mt-4 border-t border-border pt-3">
              <span className="text-xs font-medium text-muted block mb-1.5">Daily Cost Breakdown:</span>
              <div className="flex flex-wrap gap-2">
                {Object.entries(budget.byDay).map(([day, amt]) => (
                  <Badge key={day} tone="neutral">
                    {day}: ${amt.toFixed(2)}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}

      <div className="space-y-4">
        {stops.map((stop, idx) => {
          const cityName = stop.city?.name || `Stop #${idx + 1}`;
          const cityCountry = stop.city?.country;
          return (
            <Card key={stop.id}>
              <div className="flex items-center justify-between border-b border-border pb-3 mb-3">
                <div>
                  <h3 className="text-lg font-bold text-primary">
                    {cityName} {cityCountry ? <span className="text-sm font-normal text-muted">({cityCountry})</span> : null}
                  </h3>
                  <div className="mt-1 flex flex-wrap gap-2 text-xs">
                    {stop.startDate && <Badge tone="neutral">{stop.startDate}</Badge>}
                    {stop.startDate && stop.endDate && <span className="text-muted">→</span>}
                    {stop.endDate && <Badge tone="neutral">{stop.endDate}</Badge>}
                    <Badge tone="primary">Stop {idx + 1}</Badge>
                  </div>
                </div>
              </div>

              {stop.activities && stop.activities.length > 0 ? (
                <ul className="space-y-2">
                  {stop.activities.map((a) => (
                    <li
                      key={a.id}
                      className="flex items-center justify-between rounded-xl bg-bg px-4 py-3 border border-border/60"
                    >
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-primary">
                          {a.activity?.name ?? a.customName}
                        </span>
                        {a.activity?.category && (
                          <Badge tone="accent" className="capitalize">
                            {a.activity.category}
                          </Badge>
                        )}
                        {a.scheduledDate && (
                          <span className="text-xs text-muted">Scheduled: {a.scheduledDate}</span>
                        )}
                      </div>
                      <span className="text-sm font-bold text-primary">
                        ${(a.customCost || a.activity?.cost || 0).toFixed(2)}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted italic">No activities planned for this stop yet.</p>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
