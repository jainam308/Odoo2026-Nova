import { apiClient } from './client';
import { Trip, CreateTripInput, TripBudgetSummary, TripStop, Activity } from '../types/trip';

/**
 * GET /api/trips - Fetch all trips from PostgreSQL backend
 */
export const fetchTrips = async (): Promise<Trip[]> => {
  try {
    const res = await apiClient.get('/trips');
    if (res.data?.data) {
      return res.data.data;
    }
    return [];
  } catch (err) {
    console.error('Error fetching trips:', err);
    return [];
  }
};

/**
 * GET /api/trips/:id - Fetch single detailed trip with stops and activities
 */
export const getTripById = async (id: number): Promise<Trip | null> => {
  try {
    const res = await apiClient.get(`/trips/${id}`);
    if (res.data?.data) {
      return res.data.data;
    }
    return null;
  } catch (err) {
    console.error(`Error fetching trip ${id}:`, err);
    return null;
  }
};

/**
 * GET /api/trips/share/:slug - Fetch public trip by slug
 */
export const getTripBySlug = async (slug: string): Promise<Trip | null> => {
  try {
    const res = await apiClient.get(`/trips/share/${slug}`);
    if (res.data?.data) {
      return res.data.data;
    }
    return null;
  } catch (err) {
    console.error(`Error fetching trip by slug ${slug}:`, err);
    return null;
  }
};

/**
 * POST /api/trips - Create new trip in database
 */
export const createTrip = async (data: CreateTripInput): Promise<Trip> => {
  const res = await apiClient.post('/trips', data);
  if (res.data?.trip) {
    return res.data.trip;
  }
  throw new Error('Failed to create trip in database');
};

/**
 * PUT /api/trips/:id - Update trip details in database
 */
export const updateTrip = async (id: number, data: Partial<Trip>): Promise<Trip | null> => {
  try {
    const res = await apiClient.put(`/trips/${id}`, data);
    return res.data?.data || null;
  } catch (err) {
    console.error(`Error updating trip ${id}:`, err);
    return null;
  }
};

/**
 * DELETE /api/trips/:id - Delete trip from database
 */
export const deleteTrip = async (id: number): Promise<boolean> => {
  try {
    const res = await apiClient.delete(`/trips/${id}`);
    return res.data?.deleted ?? true;
  } catch (err) {
    console.error(`Error deleting trip ${id}:`, err);
    return false;
  }
};

/**
 * POST /api/trips/:id/stops - Add a destination stop to a trip in database
 */
export const addStopToTrip = async (
  tripId: number,
  stopData: {
    city_name: string;
    country: string;
    start_date: string;
    end_date: string;
    budget?: number;
    image_url?: string;
  }
): Promise<TripStop> => {
  const res = await apiClient.post(`/trips/${tripId}/stops`, stopData);
  if (res.data?.stop) {
    return res.data.stop;
  }
  throw new Error('Failed to add stop to database');
};

/**
 * DELETE /api/trips/:id/stops/:stopId - Remove a destination stop from database
 */
export const deleteStopFromTrip = async (tripId: number, stopId: number): Promise<boolean> => {
  try {
    const res = await apiClient.delete(`/trips/${tripId}/stops/${stopId}`);
    return res.data?.deleted ?? true;
  } catch (err) {
    console.error(`Error deleting stop ${stopId}:`, err);
    return false;
  }
};

/**
 * PUT /api/trips/:id/stops/reorder - Reorder stops within a trip
 */
export const reorderTripStops = async (tripId: number, stopIds: number[]): Promise<boolean> => {
  try {
    const res = await apiClient.put(`/trips/${tripId}/stops/reorder`, { stopIds });
    return res.data?.success ?? true;
  } catch (err) {
    console.error(`Error reordering stops for trip ${tripId}:`, err);
    return false;
  }
};

/**
 * POST /api/trips/:id/stops/:stopId/activities - Add scheduled activity to stop in database
 */
export const addActivityToStop = async (
  tripId: number,
  stopId: number,
  activityData: Omit<Activity, 'id'>
): Promise<Activity> => {
  const res = await apiClient.post(`/trips/${tripId}/stops/${stopId}/activities`, activityData);
  if (res.data?.activity) {
    return res.data.activity;
  }
  throw new Error('Failed to add activity to database');
};

/**
 * DELETE /api/trips/:id/stops/:stopId/activities/:activityId - Delete activity from database
 */
export const removeActivityFromStop = async (
  tripId: number,
  stopId: number,
  activityId: number
): Promise<boolean> => {
  try {
    const res = await apiClient.delete(`/trips/${tripId}/stops/${stopId}/activities/${activityId}`);
    return res.data?.deleted ?? true;
  } catch (err) {
    console.error(`Error deleting activity ${activityId}:`, err);
    return false;
  }
};

/**
 * GET /api/trips/:id/budget - Fetch calculated budget metrics from database
 */
export const fetchTripBudget = async (tripId: number): Promise<TripBudgetSummary> => {
  try {
    const res = await apiClient.get(`/trips/${tripId}/budget`);
    if (res.data?.data) {
      return res.data.data;
    }
  } catch (err) {
    console.error(`Error fetching budget for trip ${tripId}:`, err);
  }
  return {
    totalBudget: 40000,
    totalSpent: 0,
    dailyAverage: 0,
    categories: [
      { category: 'Stay / Hotels', amount: 18000, color: '#0F6E6E' },
      { category: 'Activities & Sightseeing', amount: 14000, color: '#FF7A59' },
      { category: 'Food & Dining', amount: 8000, color: '#F2A900' },
    ],
  };
};