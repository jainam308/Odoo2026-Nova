import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { getPublicTrip, copyPublicTrip, type PublicTrip } from '../../api/itinerary.api';
import { useAuth } from '../../context/AuthContext';

function getErrorMessage(e: unknown): string {
  if (typeof e === 'object' && e !== null && 'response' in e) {
    const res = (e as { response?: { data?: { error?: string } } }).response;
    if (res?.data?.error) return res.data.error;
  }
  if (e instanceof Error) return e.message;
  return 'Trip not available';
}

export default function PublicItinerary() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [data, setData] = useState<PublicTrip | null>(null);
  const [loading, setLoading] = useState(Boolean(slug));
  const [error, setError] = useState<string | null>(null);
  const [copying, setCopying] = useState(false);
  const [copyMsg, setCopyMsg] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (!slug) return;

    getPublicTrip(slug)
      .then((res) => {
        if (active) {
          setData(res);
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
  }, [slug]);

  async function handleCopyTrip() {
    if (!slug) return;
    if (!token) {
      setCopyMsg('Please log in first to copy this trip to your account.');
      return;
    }

    setCopying(true);
    setCopyMsg(null);
    try {
      const cloned = await copyPublicTrip(slug);
      navigate(`/itinerary?tripId=${cloned.id}`);
    } catch (e: unknown) {
      setCopyMsg(getErrorMessage(e));
    } finally {
      setCopying(false);
    }
  }

  if (loading) return <LoadingSpinner label="Loading shared public trip…" />;
  if (error)
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <EmptyState title="Cannot view this trip" description={error} />
      </div>
    );
  if (!data) return null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge tone="success">Public Share</Badge>
            {data.trip.startDate && (
              <span className="text-xs text-muted">
                {data.trip.startDate} {data.trip.endDate ? `→ ${data.trip.endDate}` : ''}
              </span>
            )}
          </div>
          <h1 className="mt-2 text-3xl font-bold text-primary">{data.trip.name}</h1>
          {data.trip.description && <p className="mt-1 text-muted">{data.trip.description}</p>}
        </div>
        <div className="flex flex-col items-end gap-1">
          <Button variant="accent" onClick={handleCopyTrip} disabled={copying}>
            {copying ? 'Copying trip…' : 'Copy Trip to My Account'}
          </Button>
          {copyMsg && <p className="text-xs text-danger mt-1">{copyMsg}</p>}
        </div>
      </div>

      <div className="space-y-4">
        {data.stops.map((stop, idx) => {
          const cityName = stop.city?.name || `Stop #${idx + 1}`;
          const cityCountry = stop.city?.country;
          return (
            <Card key={stop.id}>
              <div className="flex items-center justify-between border-b border-border pb-3 mb-3">
                <h3 className="text-lg font-bold text-primary">
                  {cityName} {cityCountry ? <span className="text-sm font-normal text-muted">({cityCountry})</span> : null}
                </h3>
                <div className="flex gap-2 text-xs">
                  {stop.startDate && <Badge tone="neutral">{stop.startDate}</Badge>}
                  {stop.endDate && <Badge tone="neutral">{stop.endDate}</Badge>}
                  <Badge tone="primary">Stop {idx + 1}</Badge>
                </div>
              </div>

              {stop.activities && stop.activities.length > 0 ? (
                <ul className="space-y-2">
                  {stop.activities.map((a) => (
                    <li key={a.id} className="flex items-center justify-between rounded-lg bg-[#f9fafb] px-3.5 py-2.5 border border-border/50">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-[#1f2937]">
                          {a.activity?.name ?? a.customName}
                        </span>
                        {a.activity?.category && (
                          <Badge tone="accent" className="capitalize">
                            {a.activity.category}
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs font-semibold text-primary">${a.customCost || a.activity?.cost || 0}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted italic">No activities listed for this stop.</p>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
