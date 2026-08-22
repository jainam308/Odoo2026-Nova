import { apiClient } from './client';

export interface AIPlanRequest {
  message: string;
  city?: string;
  start_date?: string;
  end_date?: string;
  budget?: number;
}

export interface AIActivity {
  name: string;
  estimated_cost: number;
  category: 'sightseeing' | 'food' | 'adventure' | 'nightlife' | 'culture';
  duration_hours?: number;
  scheduled_time?: string;
  notes?: string;
}

export interface AIDayPlan {
  day: number;
  city: string;
  activities: AIActivity[];
}

export interface AIPlanResponse {
  days: AIDayPlan[];
  total_estimated_cost: number;
}

export const aiApi = {
  planTrip: async (payload: AIPlanRequest): Promise<AIPlanResponse> => {
    const res = await apiClient.post<{ success: boolean; data: AIPlanResponse }>('/ai/plan', payload);
    return res.data.data;
  },
};

export default aiApi;
