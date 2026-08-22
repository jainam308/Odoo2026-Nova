import apiClient from './client';

export interface City {
  id: number;
  name: string;
  country: string;
  cost_index: number;
  popularity: number;
  image_url: string | null;
}

export interface Activity {
  id: number;
  city_id: number;
  name: string;
  category: string;
  description: string | null;
  cost: number | string;
  duration_minutes: number | null;
  image_url: string | null;
  city_name?: string;
  city_country?: string;
}

export const discoveryApi = {
  getCities: async (search?: string, country?: string): Promise<City[]> => {
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (country) params.country = country;
    const res = await apiClient.get<{ success: boolean; data: City[] }>('/cities', { params });
    return res.data.data;
  },

  getCityById: async (id: number | string): Promise<City> => {
    const res = await apiClient.get<{ success: boolean; data: City }>(`/cities/${id}`);
    return res.data.data;
  },

  getActivities: async (city_id?: number | string, category?: string, search?: string): Promise<Activity[]> => {
    const params: Record<string, string> = {};
    if (city_id) params.city_id = String(city_id);
    if (category && category !== 'all') params.category = category;
    if (search) params.search = search;
    const res = await apiClient.get<{ success: boolean; data: Activity[] }>('/activities', { params });
    return res.data.data;
  },

  getActivityById: async (id: number | string): Promise<Activity> => {
    const res = await apiClient.get<{ success: boolean; data: Activity }>(`/activities/${id}`);
    return res.data.data;
  },
};

export default discoveryApi;
