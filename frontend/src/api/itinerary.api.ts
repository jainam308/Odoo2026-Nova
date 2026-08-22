import client from './client';

// ---- Module C (Itinerary & Sharing) own endpoints ----

export interface StopActivity {
  id: number;
  stopId: number;
  activityId: number | null;
  customName: string | null;
  customCost: number;
  scheduledDate: string | null;
  orderIndex: number;
  notes: string | null;
  activity: {
    name: string | null;
    category: string | null;
    description: string | null;
    cost: number;
    durationMinutes: number | null;
    imageUrl: string | null;
  } | null;
}

export interface Stop {
  id: number;
  tripId: number;
  cityId: number | null;
  startDate: string | null;
  endDate: string | null;
  orderIndex: number;
  budget: number;
  city?: {
    id: number;
    name: string;
    country: string;
    imageUrl: string | null;
  } | null;
  activities?: StopActivity[];
}

export interface BudgetSummary {
  total: number;
  byCategory: Record<string, number>;
  byDay: Record<string, number>;
}

// ---- Local demo fallback (Module C stand-alone mode) ----
// The Itinerary Builder reads Trips (Module B), Cities and Activities (Module A)
// via their APIs. While those modules are still in development those endpoints
// may be unavailable. Per the build spec (§13) we fall back to a hardcoded
// dataset matching the shared seed shape so Module C stays fully usable. When
// the real endpoints come online this code is bypassed automatically.
const DEMO_CITIES: City[] = [
  { id: 1, name: 'Paris', country: 'France', costIndex: 5, popularity: 95, imageUrl: null },
  { id: 2, name: 'Tokyo', country: 'Japan', costIndex: 4, popularity: 92, imageUrl: null },
  { id: 3, name: 'Goa', country: 'India', costIndex: 2, popularity: 78, imageUrl: null },
  { id: 4, name: 'Rome', country: 'Italy', costIndex: 4, popularity: 90, imageUrl: null },
  { id: 5, name: 'Bali', country: 'Indonesia', costIndex: 2, popularity: 85, imageUrl: null },
  { id: 6, name: 'New York', country: 'USA', costIndex: 5, popularity: 93, imageUrl: null },
  { id: 7, name: 'Barcelona', country: 'Spain', costIndex: 3, popularity: 88, imageUrl: null },
  { id: 8, name: 'Reykjavik', country: 'Iceland', costIndex: 5, popularity: 70, imageUrl: null },
  { id: 9, name: 'Bangkok', country: 'Thailand', costIndex: 2, popularity: 82, imageUrl: null },
  { id: 10, name: 'Lisbon', country: 'Portugal', costIndex: 3, popularity: 80, imageUrl: null },
];

const DEMO_ACTIVITIES: Activity[] = [
  { id: 1, cityId: 1, name: 'Eiffel Tower visit', category: 'sightseeing', description: null, cost: 25, durationMinutes: 120, imageUrl: null },
  { id: 2, cityId: 1, name: 'Louvre Museum', category: 'culture', description: null, cost: 17, durationMinutes: 180, imageUrl: null },
  { id: 3, cityId: 1, name: 'Seine dinner cruise', category: 'food', description: null, cost: 90, durationMinutes: 120, imageUrl: null },
  { id: 4, cityId: 2, name: 'Senso-ji Temple', category: 'culture', description: null, cost: 0, durationMinutes: 90, imageUrl: null },
  { id: 5, cityId: 2, name: 'Shibuya food tour', category: 'food', description: null, cost: 60, durationMinutes: 150, imageUrl: null },
  { id: 6, cityId: 2, name: 'Akihabara night walk', category: 'nightlife', description: null, cost: 30, durationMinutes: 120, imageUrl: null },
  { id: 7, cityId: 3, name: 'Baga Beach visit', category: 'sightseeing', description: null, cost: 0, durationMinutes: 180, imageUrl: null },
  { id: 8, cityId: 3, name: 'Water sports', category: 'adventure', description: null, cost: 40, durationMinutes: 90, imageUrl: null },
  { id: 9, cityId: 3, name: 'Goan seafood dinner', category: 'food', description: null, cost: 25, durationMinutes: 90, imageUrl: null },
  { id: 10, cityId: 4, name: 'Colosseum tour', category: 'sightseeing', description: null, cost: 20, durationMinutes: 120, imageUrl: null },
  { id: 11, cityId: 4, name: 'Vatican Museums', category: 'culture', description: null, cost: 21, durationMinutes: 180, imageUrl: null },
  { id: 12, cityId: 4, name: 'Trastevere food walk', category: 'food', description: null, cost: 55, durationMinutes: 150, imageUrl: null },
  { id: 13, cityId: 5, name: 'Ubud rice terraces', category: 'sightseeing', description: null, cost: 5, durationMinutes: 120, imageUrl: null },
  { id: 14, cityId: 5, name: 'Surf lesson', category: 'adventure', description: null, cost: 35, durationMinutes: 120, imageUrl: null },
  { id: 15, cityId: 5, name: 'Temple sunset', category: 'culture', description: null, cost: 0, durationMinutes: 90, imageUrl: null },
  { id: 16, cityId: 6, name: 'Statue of Liberty', category: 'sightseeing', description: null, cost: 24, durationMinutes: 180, imageUrl: null },
  { id: 17, cityId: 6, name: 'Broadway show', category: 'nightlife', description: null, cost: 120, durationMinutes: 150, imageUrl: null },
  { id: 18, cityId: 6, name: 'Central Park bike', category: 'adventure', description: null, cost: 20, durationMinutes: 120, imageUrl: null },
  { id: 19, cityId: 7, name: 'Sagrada Familia', category: 'culture', description: null, cost: 33, durationMinutes: 120, imageUrl: null },
  { id: 20, cityId: 7, name: 'Tapas crawl', category: 'food', description: null, cost: 45, durationMinutes: 150, imageUrl: null },
  { id: 21, cityId: 7, name: 'Barceloneta beach', category: 'sightseeing', description: null, cost: 0, durationMinutes: 120, imageUrl: null },
  { id: 22, cityId: 8, name: 'Blue Lagoon', category: 'adventure', description: null, cost: 80, durationMinutes: 240, imageUrl: null },
  { id: 23, cityId: 8, name: 'Golden Circle tour', category: 'sightseeing', description: null, cost: 95, durationMinutes: 480, imageUrl: null },
  { id: 24, cityId: 8, name: 'Northern lights hunt', category: 'nightlife', description: null, cost: 60, durationMinutes: 240, imageUrl: null },
  { id: 25, cityId: 9, name: 'Grand Palace', category: 'culture', description: null, cost: 15, durationMinutes: 150, imageUrl: null },
  { id: 26, cityId: 9, name: 'Street food tour', category: 'food', description: null, cost: 20, durationMinutes: 150, imageUrl: null },
  { id: 27, cityId: 9, name: 'Chao Phraya cruise', category: 'sightseeing', description: null, cost: 30, durationMinutes: 120, imageUrl: null },
  { id: 28, cityId: 10, name: 'Tram 28 ride', category: 'sightseeing', description: null, cost: 4, durationMinutes: 90, imageUrl: null },
  { id: 29, cityId: 10, name: 'Fado dinner', category: 'nightlife', description: null, cost: 50, durationMinutes: 150, imageUrl: null },
  { id: 30, cityId: 10, name: 'Pastel de nata class', category: 'food', description: null, cost: 35, durationMinutes: 120, imageUrl: null },
];

const DEMO_TRIPS: Trip[] = [
  { id: 1, name: 'European Escape', description: 'Paris & Rome in style.', startDate: '2026-09-01', endDate: '2026-09-10', coverPhotoUrl: null, isPublic: true, shareSlug: 'europe-escape' },
  { id: 2, name: 'Asia Backpacking', description: 'Tokyo to Bali.', startDate: '2026-10-01', endDate: '2026-10-10', coverPhotoUrl: null, isPublic: false, shareSlug: null },
  { id: 3, name: 'Summer in Iberia', description: 'Barcelona & Lisbon.', startDate: '2026-07-01', endDate: '2026-07-09', coverPhotoUrl: null, isPublic: true, shareSlug: 'iberia-summer' },
];

async function safeGet<T>(url: string, params: Record<string, unknown> | undefined, fallback: T): Promise<T> {
  try {
    const { data } = await client.get(url, { params });
    if (data && data.success === false) return fallback;
    return (data?.data ?? fallback) as T;
  } catch {
    return fallback;
  }
}

export async function getStops(tripId: number): Promise<Stop[]> {
  const { data } = await client.get(`/trips/${tripId}/stops`);
  return data.data as Stop[];
}

export async function createStop(
  tripId: number,
  body: { cityId: number; startDate?: string; endDate?: string; orderIndex?: number }
): Promise<Stop> {
  const { data } = await client.post(`/trips/${tripId}/stops`, body);
  return data.data as Stop;
}

export async function updateStop(
  id: number,
  body: Partial<{ cityId: number; startDate: string; endDate: string; orderIndex: number; budget: number }>
): Promise<Stop> {
  const { data } = await client.put(`/stops/${id}`, body);
  return data.data as Stop;
}

export async function deleteStop(id: number): Promise<void> {
  await client.delete(`/stops/${id}`);
}

export async function createStopActivity(
  stopId: number,
  body: {
    activityId?: number;
    customName?: string;
    customCost?: number;
    scheduledDate?: string;
    orderIndex?: number;
    notes?: string;
  }
): Promise<StopActivity> {
  const { data } = await client.post(`/stops/${stopId}/activities`, body);
  return data.data as StopActivity;
}

export async function updateStopActivity(
  id: number,
  body: Partial<{
    activityId: number;
    customName: string;
    customCost: number;
    scheduledDate: string;
    orderIndex: number;
    notes: string;
  }>
): Promise<StopActivity> {
  const { data } = await client.put(`/stop-activities/${id}`, body);
  return data.data as StopActivity;
}

export async function deleteStopActivity(id: number): Promise<void> {
  await client.delete(`/stop-activities/${id}`);
}

export async function getBudgetSummary(tripId: number): Promise<BudgetSummary> {
  const { data } = await client.get(`/trips/${tripId}/budget-summary`);
  return data.data as BudgetSummary;
}

export interface PublicTrip {
  trip: {
    id: number;
    name: string;
    description: string | null;
    startDate: string | null;
    endDate: string | null;
    coverPhotoUrl: string | null;
    shareSlug?: string | null;
  };
  stops: Stop[];
}

export async function getPublicTrip(slug: string): Promise<PublicTrip> {
  const { data } = await client.get(`/public/trips/${slug}`);
  return data.data as PublicTrip;
}

export async function copyPublicTrip(slug: string): Promise<{ id: number; name: string }> {
  const { data } = await client.post(`/public/trips/${slug}/copy`);
  return data.data as { id: number; name: string };
}

// ---- Read-only cross-module reads (Module A cities/activities, Module B trips) ----
// Module C may READ these via API; it never writes them.

export interface City {
  id: number;
  name: string;
  country: string;
  costIndex: number;
  popularity: number;
  imageUrl: string | null;
}

export async function getCities(params?: { search?: string; country?: string }): Promise<City[]> {
  return safeGet<City[]>('/cities', params, DEMO_CITIES);
}

export interface Activity {
  id: number;
  cityId: number;
  name: string;
  category: string;
  description: string | null;
  cost: number;
  durationMinutes: number | null;
  imageUrl: string | null;
}

export async function getActivities(params?: { cityId?: number; category?: string }): Promise<Activity[]> {
  const list = await safeGet<Activity[]>('/activities', params, DEMO_ACTIVITIES);
  const cityId = params?.cityId;
  const category = params?.category;
  return list.filter(
    (a) => (cityId == null || a.cityId === cityId) && (!category || a.category === category)
  );
}

export interface Trip {
  id: number;
  name: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  coverPhotoUrl: string | null;
  isPublic: boolean;
  shareSlug: string | null;
}

export async function getTrips(): Promise<Trip[]> {
  return safeGet<Trip[]>('/trips', undefined, DEMO_TRIPS);
}
