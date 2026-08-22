import apiClient from './client';

export interface User {
  id: number;
  first_name: string;
  last_name?: string | null;
  email: string;
  phone?: string | null;
  city?: string | null;
  country?: string | null;
  photo_url?: string | null;
  bio?: string | null;
  created_at?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface SignupPayload {
  first_name: string;
  last_name?: string;
  email: string;
  password: string;
  phone?: string;
  city?: string;
  country?: string;
  bio?: string;
  photo_url?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface GoogleLoginPayload {
  email: string;
  first_name?: string;
  last_name?: string;
  photo_url?: string;
  google_id?: string;
}

export const authApi = {
  signup: async (payload: SignupPayload): Promise<AuthResponse> => {
    const res = await apiClient.post<{ success: boolean; data: AuthResponse }>('/auth/signup', payload);
    return res.data.data;
  },

  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const res = await apiClient.post<{ success: boolean; data: AuthResponse }>('/auth/login', payload);
    return res.data.data;
  },

  googleLogin: async (payload: GoogleLoginPayload): Promise<AuthResponse> => {
    const res = await apiClient.post<{ success: boolean; data: AuthResponse }>('/auth/google', payload);
    return res.data.data;
  },

  getMe: async (): Promise<User> => {
    const res = await apiClient.get<{ success: boolean; data: User }>('/users/me');
    return res.data.data;
  },

  updateMe: async (payload: Partial<User>): Promise<User> => {
    const res = await apiClient.put<{ success: boolean; data: User }>('/users/me', payload);
    return res.data.data;
  },
};

export default authApi;
