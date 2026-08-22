export interface Trip {
  id: number;
  user_id: number;
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  cover_photo_url?: string;
  is_public: boolean;
  share_slug?: string;
  created_at?: string;
}

export interface CreateTripInput {
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  cover_photo_url?: string;
}