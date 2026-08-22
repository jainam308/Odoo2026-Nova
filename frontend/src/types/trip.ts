export interface Activity {
  id: number;
  city_id?: number;
  name: string;
  category: 'Sightseeing' | 'Adventure' | 'Food & Dining' | 'Culture' | 'Nightlife' | 'Shopping' | 'Nature' | string;
  cost: number;
  duration_hours?: number;
  image_url?: string;
  description?: string;
  rating?: number;
  scheduled_time?: string;
  day_number?: number;
  notes?: string;
}

export interface TripStop {
  id: number;
  trip_id: number;
  city_id?: number;
  city_name: string;
  country: string;
  start_date: string;
  end_date: string;
  budget?: number;
  image_url?: string;
  activities: Activity[];
}

export interface BudgetCategory {
  category: string;
  amount: number;
  color: string;
}

export interface TripBudgetSummary {
  totalBudget: number;
  totalSpent: number;
  dailyAverage: number;
  categories: BudgetCategory[];
}

export interface Trip {
  id: number;
  user_id?: number;
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  cover_photo_url?: string;
  is_public?: boolean;
  share_slug?: string;
  created_at?: string;
  stops?: TripStop[];
  estimated_cost?: number;
  status?: 'ongoing' | 'upcoming' | 'completed';
}

export interface CreateTripInput {
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  cover_photo_url?: string;
  is_public?: boolean;
}