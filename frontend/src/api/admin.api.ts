import client from './client';

export interface AdminStats {
  usersCount: number;
  tripsCount: number;
  citiesCount: number;
  activitiesCount: number;
}

export interface AdminUser {
  id: number;
  first_name: string;
  last_name: string | null;
  email: string;
  phone: string | null;
  city: string | null;
  country: string | null;
  photo_url: string | null;
  bio: string | null;
  is_admin: boolean;
  created_at: string;
  trip_count: number;
}

export interface AdminTrip {
  id: number;
  user_id: number;
  name: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  cover_photo_url: string | null;
  is_public: boolean;
  share_slug: string | null;
  created_at: string;
  owner_name: string;
  owner_email: string;
  stop_count: number;
}

export interface AdminAnalytics {
  popularCities: Array<{
    id: number;
    name: string;
    country: string;
    cost_index: number;
    popularity: number;
    image_url: string | null;
    visit_count: number;
  }>;
  popularActivities: Array<{
    id: number;
    name: string;
    category: string;
    cost: number;
    duration_minutes: number | null;
    city_name: string;
    city_country: string;
    selection_count: number;
  }>;
  categoryBreakdown: Array<{
    category: string;
    count: number;
  }>;
  monthlyTrends: Array<{
    month: string;
    users: number;
    trips: number;
    budget: number;
  }>;
  budgetDistribution: Array<{
    level: string;
    count: number;
    percentage: number;
  }>;
}

export async function fetchAdminStats(): Promise<AdminStats> {
  const { data } = await client.get('/admin/stats');
  return data.data;
}

export async function fetchAdminAnalytics(): Promise<AdminAnalytics> {
  const { data } = await client.get('/admin/analytics');
  return data.data;
}

export async function fetchAdminUsers(): Promise<AdminUser[]> {
  const { data } = await client.get('/admin/users');
  return data.data;
}

export async function updateAdminUser(id: number, body: Partial<AdminUser>): Promise<AdminUser> {
  const { data } = await client.put(`/admin/users/${id}`, body);
  return data.data;
}

export async function deleteAdminUser(id: number): Promise<void> {
  await client.delete(`/admin/users/${id}`);
}

export async function fetchAdminTrips(): Promise<AdminTrip[]> {
  const { data } = await client.get('/admin/trips');
  return data.data;
}

export async function updateAdminTrip(id: number, body: Partial<AdminTrip>): Promise<AdminTrip> {
  const { data } = await client.put(`/admin/trips/${id}`, body);
  return data.data;
}

export async function deleteAdminTrip(id: number): Promise<void> {
  await client.delete(`/admin/trips/${id}`);
}

export async function createAdminCity(body: {
  name: string;
  country: string;
  cost_index?: number;
  popularity?: number;
  image_url?: string;
}): Promise<unknown> {
  const { data } = await client.post('/admin/cities', body);
  return data.data;
}

export async function deleteAdminCity(id: number): Promise<void> {
  await client.delete(`/admin/cities/${id}`);
}

export async function createAdminActivity(body: {
  city_id: number;
  name: string;
  category?: string;
  description?: string;
  cost?: number;
  duration_minutes?: number;
}): Promise<unknown> {
  const { data } = await client.post('/admin/activities', body);
  return data.data;
}

export async function deleteAdminActivity(id: number): Promise<void> {
  await client.delete(`/admin/activities/${id}`);
}
