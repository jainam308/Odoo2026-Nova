import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Badge, LoadingSpinner, EmptyState } from '../../components';
import { fetchTrips } from '../../api/trips.api';
import { getStops } from '../../api/itinerary.api';
import { Trip } from '../../types/trip';
import { Calendar as CalendarIcon, MapPin, Clock, DollarSign, ArrowRight } from 'lucide-react';

interface DayActivityItem {
  date: string;
  cityName: string;
  cityCountry?: string;
  activity: string;
  category: string | null;
  cost: number;
}

export const GlobalCalendarPage: React.FC = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<number | null>(null);
  const [timelineItems, setTimelineItems] = useState<DayActivityItem[]>([]);
  const [loadingTrips, setLoadingTrips] = useState(true);
  const [loadingTimeline, setLoadingTimeline] = useState(false);

  useEffect(() => {
    let active = true;
    fetchTrips()
      .then((data) => {
        if (!active) return;
        setTrips(data);
        if (data.length > 0) {
          setSelectedTripId(data[0].id);
        }
      })
      .catch((err) => console.error('Failed to load trips for calendar:', err))
      .finally(() => {
        if (active) setLoadingTrips(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedTripId) {
      setTimelineItems([]);
      return;
    }

    let active = true;
    setLoadingTimeline(true);

    getStops(selectedTripId)
      .then((stops) => {
        if (!active) return;
        const flat: DayActivityItem[] = [];
        for (const stop of stops) {
          const baseDate = stop.startDate ?? '';
          const cityName = stop.city?.name || (stop as any).city_name || 'City Stop';
          const cityCountry = stop.city?.country || (stop as any).country;
          for (const a of stop.activities ?? []) {
            flat.push({
              date: a.scheduledDate ?? baseDate,
              cityName,
              cityCountry,
              activity: a.activity?.name ?? a.customName ?? (a as any).name ?? 'Activity',
              category: a.activity?.category ?? (a as any).category ?? null,
              cost: a.customCost || a.activity?.cost || (a as any).cost || 0,
            });
          }
        }
        flat.sort((x, y) => (x.date || 'zzz').localeCompare(y.date || 'zzz'));
        setTimelineItems(flat);
      })
      .catch((err) => console.error('Failed to load timeline:', err))
      .finally(() => {
        if (active) setLoadingTimeline(false);
      });

    return () => {
      active = false;
    };
  }, [selectedTripId]);

  const selectedTrip = trips.find((t) => t.id === selectedTripId);

  if (loadingTrips) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
        <LoadingSpinner text="Loading your travel calendar..." size="lg" />
      </div>
    );
  }

  if (trips.length === 0) {
    return (
      <div style={{ maxWidth: '800px', margin: '60px auto', padding: '0 16px' }}>
        <EmptyState
          title="No Travel Itineraries Yet"
          description="Create your first trip to visualize day-wise activities, stops, and schedules on your travel calendar."
          icon={<CalendarIcon size={48} />}
          actionText="Plan Your First Trip"
          onAction={() => window.location.assign('/trips/new')}
        />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '36px 20px 60px' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: 'var(--color-primary-light)',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CalendarIcon size={20} />
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-primary)' }}>
            Trip Calendar & Day Timeline
          </h1>
        </div>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>
          Visualize schedules, scheduled dates, and estimated activity costs for your journeys
        </p>
      </div>

      {/* Trip Selector Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '10px',
          overflowX: 'auto',
          paddingBottom: '12px',
          marginBottom: '24px',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        {trips.map((trip) => {
          const isSelected = trip.id === selectedTripId;
          return (
            <button
              key={trip.id}
              onClick={() => setSelectedTripId(trip.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: 'var(--radius-md)',
                border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                backgroundColor: isSelected ? 'var(--color-primary-light)' : '#ffffff',
                color: isSelected ? 'var(--color-primary)' : 'var(--color-text)',
                fontWeight: isSelected ? 700 : 500,
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
              }}
            >
              <span>{trip.name}</span>
              {trip.start_date && (
                <span
                  style={{
                    fontSize: '11px',
                    opacity: 0.8,
                    backgroundColor: isSelected ? 'rgba(15,110,110,0.15)' : 'var(--color-bg)',
                    padding: '2px 6px',
                    borderRadius: '6px',
                  }}
                >
                  {new Date(trip.start_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Trip Details Card */}
      {selectedTrip && (
        <Card style={{ padding: '24px', marginBottom: '28px', backgroundColor: '#ffffff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text)', marginBottom: '4px' }}>
                {selectedTrip.name}
              </h2>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>
                {selectedTrip.description || 'Custom multi-city travel itinerary'}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <Link to={`/trips/${selectedTrip.id}`}>
                <Button variant="secondary" size="sm">
                  View Full Itinerary <ArrowRight size={14} style={{ marginLeft: '4px' }} />
                </Button>
              </Link>
              <Link to={`/trips/${selectedTrip.id}/builder`}>
                <Button variant="primary" size="sm">
                  Edit in Builder
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      )}

      {/* Timeline Section */}
      {loadingTimeline ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <LoadingSpinner text="Loading timeline activities..." />
        </div>
      ) : timelineItems.length === 0 ? (
        <Card style={{ padding: '40px', textAlign: 'center' }}>
          <Clock size={40} style={{ color: 'var(--color-text-light)', margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--color-text)', marginBottom: '6px' }}>
            No Activities Scheduled Yet
          </h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '13px', marginBottom: '20px' }}>
            Add cities, stops, and activities in the Itinerary Builder to generate your day-wise timeline.
          </p>
          {selectedTripId && (
            <Link to={`/trips/${selectedTripId}/builder`}>
              <Button variant="primary">Add Activities Now</Button>
            </Link>
          )}
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {timelineItems.map((item, idx) => (
            <Card
              key={idx}
              style={{
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px',
                borderLeft: '4px solid var(--color-primary)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <div
                  style={{
                    backgroundColor: 'var(--color-primary-light)',
                    color: 'var(--color-primary)',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    fontWeight: 700,
                    fontSize: '13px',
                    textAlign: 'center',
                    minWidth: '90px',
                  }}
                >
                  {item.date ? new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : `Day ${idx + 1}`}
                </div>
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text)', marginBottom: '4px' }}>
                    {item.activity}
                  </h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--color-text-muted)', fontSize: '13px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={13} style={{ color: 'var(--color-primary)' }} />
                      {item.cityName}{item.cityCountry ? `, ${item.cityCountry}` : ''}
                    </span>
                    {item.category && (
                      <Badge variant="primary">
                        {item.category}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {item.cost > 0 && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '15px',
                    fontWeight: 700,
                    color: 'var(--color-accent-dark)',
                    backgroundColor: 'var(--color-accent-light)',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  <DollarSign size={15} />
                  <span>{item.cost.toLocaleString()}</span>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default GlobalCalendarPage;
