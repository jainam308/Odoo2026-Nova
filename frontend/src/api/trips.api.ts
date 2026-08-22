import axios from 'axios';
import { Trip, CreateTripInput, TripBudgetSummary, TripStop, Activity } from '../types/trip';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Fallback in-memory mock data with complete stops and activities
let localTrips: Trip[] = [
  {
    id: 1,
    name: 'Summer in Goa',
    description: 'Relaxing beach vacation with water sports, coastal cuisine, and Portuguese heritage exploration.',
    start_date: '2026-09-10',
    end_date: '2026-09-16',
    cover_photo_url: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=80',
    is_public: true,
    share_slug: 'summer-in-goa-2026',
    estimated_cost: 32500,
    stops: [
      {
        id: 101,
        trip_id: 1,
        city_name: 'North Goa',
        country: 'India',
        start_date: '2026-09-10',
        end_date: '2026-09-13',
        budget: 18000,
        image_url: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=80',
        activities: [
          {
            id: 1001,
            name: 'Scuba Diving at Grand Island',
            category: 'Adventure',
            cost: 3500,
            duration_hours: 4,
            scheduled_time: '08:30 AM',
            day_number: 1,
            notes: 'Includes boat ride, equipment & underwater photos',
            rating: 4.8,
            image_url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=80'
          },
          {
            id: 1002,
            name: 'Sunset Dinner at Thalassa Vagator',
            category: 'Food & Dining',
            cost: 2200,
            duration_hours: 2.5,
            scheduled_time: '06:30 PM',
            day_number: 1,
            notes: 'Greek food with panoramic Arabian sea views',
            rating: 4.7,
            image_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80'
          },
          {
            id: 1003,
            name: 'Aguada Fort & Lighthouse Tour',
            category: 'Sightseeing',
            cost: 300,
            duration_hours: 2,
            scheduled_time: '10:00 AM',
            day_number: 2,
            notes: '17th-century Portuguese fortress',
            rating: 4.5,
            image_url: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=600&q=80'
          }
        ]
      },
      {
        id: 102,
        trip_id: 1,
        city_name: 'South Goa & Palolem',
        country: 'India',
        start_date: '2026-09-13',
        end_date: '2026-09-16',
        budget: 14500,
        image_url: 'https://images.unsplash.com/photo-1614082242765-7c98ca0f3df3?w=800&q=80',
        activities: [
          {
            id: 1004,
            name: 'Kayaking in Palolem Backwaters',
            category: 'Adventure',
            cost: 800,
            duration_hours: 2,
            scheduled_time: '07:00 AM',
            day_number: 4,
            notes: 'Serene sunrise kayaking through mangrove channels',
            rating: 4.9,
            image_url: 'https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?w=600&q=80'
          },
          {
            id: 1005,
            name: 'Cabo de Rama Fort Sunset Walk',
            category: 'Nature',
            cost: 100,
            duration_hours: 1.5,
            scheduled_time: '05:30 PM',
            day_number: 4,
            notes: 'Spectacular cliff-side ocean views',
            rating: 4.6,
            image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80'
          }
        ]
      }
    ]
  },
  {
    id: 2,
    name: 'Himalayan Trekking & Manali Expedition',
    description: 'High-altitude mountain trails, cedar forests, and paragliding across Solang Valley.',
    start_date: '2026-11-01',
    end_date: '2026-11-08',
    cover_photo_url: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&q=80',
    is_public: true,
    share_slug: 'himalayan-trekking-2026',
    estimated_cost: 28000,
    stops: [
      {
        id: 201,
        trip_id: 2,
        city_name: 'Manali',
        country: 'India',
        start_date: '2026-11-01',
        end_date: '2026-11-05',
        budget: 16000,
        image_url: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&q=80',
        activities: [
          {
            id: 2001,
            name: 'Tandem Paragliding at Solang Valley',
            category: 'Adventure',
            cost: 3200,
            duration_hours: 2,
            scheduled_time: '09:00 AM',
            day_number: 2,
            notes: 'High-fly over snowcapped peaks',
            rating: 4.9,
            image_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&q=80'
          }
        ]
      }
    ]
  },
  {
    id: 3,
    name: 'Tokyo & Kyoto Cultural Odyssey',
    description: 'Futuristic skyscrapers in Shinjuku to centuries-old Zen shrines in Kyoto and Arashiyama bamboo groves.',
    start_date: '2026-03-15',
    end_date: '2026-03-24',
    cover_photo_url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&q=80',
    is_public: true,
    share_slug: 'tokyo-kyoto-cultural-odyssey',
    estimated_cost: 145000,
    stops: [
      {
        id: 301,
        trip_id: 3,
        city_name: 'Tokyo',
        country: 'Japan',
        start_date: '2026-03-15',
        end_date: '2026-03-19',
        budget: 75000,
        image_url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&q=80',
        activities: [
          {
            id: 3001,
            name: 'TeamLab Planets Digital Art Museum',
            category: 'Culture',
            cost: 3800,
            duration_hours: 3,
            scheduled_time: '11:00 AM',
            day_number: 1,
            notes: 'Immersive body-interactive digital art exhibits',
            rating: 4.9,
            image_url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&q=80'
          }
        ]
      }
    ]
  }
];

export const fetchTrips = async (): Promise<Trip[]> => {
  try {
    const res = await api.get('/trips');
    if (res.data?.data && res.data.data.length > 0) {
      // Merge with mock details if stops are missing
      return res.data.data.map((trip: Trip) => {
        const found = localTrips.find((lt) => lt.id === trip.id);
        return found ? { ...found, ...trip } : trip;
      });
    }
    return localTrips;
  } catch {
    return localTrips;
  }
};

export const getTripById = async (id: number): Promise<Trip | null> => {
  try {
    const res = await api.get(`/trips/${id}`);
    if (res.data?.data) {
      const match = localTrips.find((t) => t.id === Number(id));
      return { ...match, ...res.data.data };
    }
  } catch {
    // fallback
  }
  const match = localTrips.find((t) => t.id === Number(id));
  return match || null;
};

export const createTrip = async (data: CreateTripInput): Promise<Trip> => {
  try {
    const res = await api.post('/trips', data);
    const serverTrip = res.data?.trip;
    if (serverTrip) {
      const fullTrip: Trip = {
        ...serverTrip,
        stops: [],
        status: 'upcoming',
        estimated_cost: 0,
      };
      localTrips.unshift(fullTrip);
      return fullTrip;
    }
  } catch {
    // fallback below
  }
  const newTrip: Trip = {
    id: Date.now(),
    ...data,
    is_public: data.is_public ?? false,
    share_slug: data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(1000 + Math.random() * 9000),
    status: 'upcoming',
    stops: [],
    estimated_cost: 0,
    created_at: new Date().toISOString(),
  };
  localTrips.unshift(newTrip);
  return newTrip;
};

export const updateTrip = async (id: number, data: Partial<Trip>): Promise<Trip | null> => {
  try {
    await api.put(`/trips/${id}`, data);
  } catch {
    // ignore
  }
  const index = localTrips.findIndex((t) => t.id === Number(id));
  if (index !== -1) {
    localTrips[index] = { ...localTrips[index], ...data };
    return localTrips[index];
  }
  return null;
};

export const deleteTrip = async (id: number): Promise<boolean> => {
  try {
    const res = await api.delete(`/trips/${id}`);
    localTrips = localTrips.filter((t) => t.id !== Number(id));
    return res.data?.deleted ?? true;
  } catch {
    localTrips = localTrips.filter((t) => t.id !== Number(id));
    return true;
  }
};

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
  const trip = localTrips.find((t) => t.id === Number(tripId));
  const newStop: TripStop = {
    id: Date.now(),
    trip_id: Number(tripId),
    ...stopData,
    activities: [],
  };
  if (trip) {
    if (!trip.stops) trip.stops = [];
    trip.stops.push(newStop);
  }
  return newStop;
};

export const deleteStopFromTrip = async (tripId: number, stopId: number): Promise<boolean> => {
  const trip = localTrips.find((t) => t.id === Number(tripId));
  if (trip && trip.stops) {
    trip.stops = trip.stops.filter((s) => s.id !== Number(stopId));
    return true;
  }
  return false;
};

export const addActivityToStop = async (
  tripId: number,
  stopId: number,
  activityData: Omit<Activity, 'id'>
): Promise<Activity> => {
  const trip = localTrips.find((t) => t.id === Number(tripId));
  const newActivity: Activity = {
    id: Date.now(),
    ...activityData,
  };
  if (trip && trip.stops) {
    const stop = trip.stops.find((s) => s.id === Number(stopId));
    if (stop) {
      if (!stop.activities) stop.activities = [];
      stop.activities.push(newActivity);
      // Update trip estimated cost
      trip.estimated_cost = (trip.estimated_cost || 0) + (newActivity.cost || 0);
    }
  }
  return newActivity;
};

export const removeActivityFromStop = async (
  tripId: number,
  stopId: number,
  activityId: number
): Promise<boolean> => {
  const trip = localTrips.find((t) => t.id === Number(tripId));
  if (trip && trip.stops) {
    const stop = trip.stops.find((s) => s.id === Number(stopId));
    if (stop && stop.activities) {
      const removed = stop.activities.find((a) => a.id === Number(activityId));
      stop.activities = stop.activities.filter((a) => a.id !== Number(activityId));
      if (removed && trip.estimated_cost) {
        trip.estimated_cost = Math.max(0, trip.estimated_cost - (removed.cost || 0));
      }
      return true;
    }
  }
  return false;
};

export const fetchTripBudget = async (tripId: number): Promise<TripBudgetSummary> => {
  const trip = localTrips.find((t) => t.id === Number(tripId));
  const totalCost = trip?.estimated_cost || 32500;
  return {
    totalBudget: 45000,
    totalSpent: totalCost,
    dailyAverage: Math.round(totalCost / 6),
    categories: [
      { category: 'Stay / Hotels', amount: Math.round(totalCost * 0.45), color: '#0F6E6E' },
      { category: 'Activities & Tours', amount: Math.round(totalCost * 0.25), color: '#FF7A59' },
      { category: 'Transport & Travel', amount: Math.round(totalCost * 0.2), color: '#2B8A8A' },
      { category: 'Meals & Dining', amount: Math.round(totalCost * 0.1), color: '#F2A900' },
    ],
  };
};