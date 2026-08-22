import { useEffect, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowUp, ArrowDown, Trash2, MapPin, Plus } from 'lucide-react';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Input from '../../components/Input';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import ItineraryNav from '../../components/ItineraryNav';
import {
  getTrips,
  getStops,
  createStop,
  updateStop,
  deleteStop,
  getCities,
  getBudgetSummary,
  type Stop,
  type Trip,
  type City,
} from '../../api/itinerary.api';
import { useAuth } from '../../context/AuthContext';
import StopActivities from './StopActivities';

function getErrorMessage(e: unknown): string {
  if (typeof e === 'object' && e !== null && 'response' in e) {
    const res = (e as { response?: { data?: { error?: string } } }).response;
    if (res?.data?.error) return res.data.error;
  }
  if (e instanceof Error) return e.message;
  return 'An unexpected error occurred';
}

export default function ItineraryBuilder() {
  const { token } = useAuth();
  const [searchParams] = useSearchParams();
  const queryTripId = searchParams.get('tripId');

  const [trips, setTrips] = useState<Trip[]>([]);
  const [tripId, setTripId] = useState<number | null>(queryTripId ? Number(queryTripId) : null);
  const [stops, setStops] = useState<Stop[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalBudget, setTotalBudget] = useState(0);

  const [cityId, setCityId] = useState<number | ''>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (token) {
      getTrips()
        .then((tList) => {
          setTrips(tList);
          if (tList.length > 0) {
            setTripId((prev) => {
              if (prev === null || !tList.some((t) => t.id === prev)) {
                return tList[0].id;
              }
              return prev;
            });
          }
        })
        .catch((err: unknown) => setError(getErrorMessage(err)));
    }
  }, [token]);

  useEffect(() => {
    getCities()
      .then(setCities)
      .catch(() => {});
  }, []);

  const refreshStops = async (targetId: number) => {
    try {
      const [data, budgetData] = await Promise.all([
        getStops(targetId),
        getBudgetSummary(targetId).catch(() => null),
      ]);
      setStops(data);
      if (budgetData) {
        setTotalBudget(budgetData.total);
      }
    } catch (e: unknown) {
      setError(getErrorMessage(e));
    }
  };

  useEffect(() => {
    let active = true;
    if (tripId) {
      Promise.all([
        getStops(tripId),
        getBudgetSummary(tripId).catch(() => null),
      ])
        .then(([data, budgetData]) => {
          if (!active) return;
          setStops(data);
          if (budgetData) {
            setTotalBudget(budgetData.total);
          }
          setLoading(false);
        })
        .catch((e: unknown) => {
          if (!active) return;
          setError(getErrorMessage(e));
          setLoading(false);
        });
    }

    return () => {
      active = false;
    };
  }, [tripId]);

  async function addStop(e: FormEvent) {
    e.preventDefault();
    if (!tripId || cityId === '') return;
    setBusy(true);
    setError(null);
    try {
      await createStop(tripId, {
        cityId: Number(cityId),
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      setCityId('');
      setStartDate('');
      setEndDate('');
      await refreshStops(tripId);
    } catch (e: unknown) {
      setError(getErrorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  async function removeStop(id: number) {
    if (!window.confirm('Delete this stop and all its activities?')) return;
    if (!tripId) return;
    setError(null);
    try {
      await deleteStop(id);
      await refreshStops(tripId);
    } catch (e: unknown) {
      setError(getErrorMessage(e));
    }
  }

  async function moveStop(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= stops.length) return;
    const a = stops[index];
    const b = stops[target];
    setError(null);
    try {
      await updateStop(a.id, { orderIndex: target });
      await updateStop(b.id, { orderIndex: index });
      const next = [...stops];
      next[index] = { ...a, orderIndex: target };
      next[target] = { ...b, orderIndex: index };
      next.sort((x, y) => x.orderIndex - y.orderIndex);
      setStops(next);
    } catch (e: unknown) {
      setError(getErrorMessage(e));
    }
  }

  const selectedTrip = trips.find((t) => t.id === tripId) ?? null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <ItineraryNav
        tripId={tripId}
        shareSlug={selectedTrip?.shareSlug}
        tripName={selectedTrip?.name}
        totalBudget={totalBudget}
      />

      {error && (
        <div className="mb-4 rounded-xl bg-danger/10 p-3.5 text-sm font-medium text-danger border border-danger/20">
          {error}
        </div>
      )}

      <Card className="mb-6">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-primary">
          <span>Active Trip</span>
          <select
            className="rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm shadow-sm focus:border-primary focus:outline-none"
            value={tripId ?? ''}
            onChange={(e) => setTripId(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">— Choose a trip —</option>
            {trips.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} {t.startDate ? `(${t.startDate})` : ''}
              </option>
            ))}
          </select>
        </label>
      </Card>

      {tripId === null && (
        <EmptyState
          title="No trip selected"
          description="Select an existing trip above to build and manage its itinerary stops."
        />
      )}

      {tripId !== null && (
        <>
          <Card className="mb-6">
            <h3 className="mb-3 text-base font-semibold text-primary flex items-center gap-2">
              <Plus className="h-4 w-4 text-accent" />
              Add a City Stop
            </h3>
            <form onSubmit={addStop} className="grid grid-cols-1 gap-3 sm:grid-cols-4">
              <label className="flex flex-col gap-1 text-sm font-medium text-primary">
                <span>City</span>
                <select
                  className="rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  value={cityId}
                  onChange={(e) => setCityId(e.target.value ? Number(e.target.value) : '')}
                  required
                >
                  <option value="">— Select city —</option>
                  {cities.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}, {c.country}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1 text-sm font-medium text-primary">
                <span>Start date</span>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </label>

              <label className="flex flex-col gap-1 text-sm font-medium text-primary">
                <span>End date</span>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </label>

              <div className="flex items-end">
                <Button variant="primary" type="submit" disabled={busy} className="w-full">
                  {busy ? 'Adding...' : 'Add Stop'}
                </Button>
              </div>
            </form>
          </Card>

          <h3 className="mb-3 text-base font-semibold text-primary">
            Itinerary Stops & Activities ({stops.length})
          </h3>

          {loading ? (
            <div className="py-12 flex justify-center">
              <LoadingSpinner label="Loading stops..." />
            </div>
          ) : stops.length === 0 ? (
            <EmptyState
              title="No stops added yet"
              description="Use the form above to add your first city destination to this trip."
            />
          ) : (
            <div className="space-y-4">
              {stops.map((stop, idx) => {
                const cityName = stop.city?.name ?? `City #${stop.cityId ?? '?'}`;
                const country = stop.city?.country;
                return (
                  <Card key={stop.id} className="relative transition-all">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3 mb-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {idx + 1}
                        </span>
                        <div>
                          <h4 className="text-base font-bold text-primary flex items-center gap-1.5">
                            <MapPin className="h-4 w-4 text-accent shrink-0" />
                            {cityName}
                            {country ? `, ${country}` : ''}
                          </h4>
                          {(stop.startDate || stop.endDate) && (
                            <p className="text-xs text-muted">
                              {stop.startDate ?? 'TBD'} — {stop.endDate ?? 'TBD'}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => moveStop(idx, -1)}
                          disabled={idx === 0}
                          className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 transition-colors"
                          title="Move up"
                        >
                          <ArrowUp className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveStop(idx, 1)}
                          disabled={idx === stops.length - 1}
                          className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 transition-colors"
                          title="Move down"
                        >
                          <ArrowDown className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeStop(stop.id)}
                          className="rounded-lg p-1.5 text-slate-400 hover:text-danger hover:bg-danger/10 transition-colors"
                          title="Remove stop"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <StopActivities
                      stop={stop}
                      onChange={() => refreshStops(tripId)}
                    />
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
