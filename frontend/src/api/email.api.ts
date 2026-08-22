import { apiClient } from './client';

export interface SendDeparturePackInput {
  tripId: number;
  emails: string[];
  customNote?: string;
  attachIcs?: boolean;
}

export interface SendDeparturePackResponse {
  success: boolean;
  message: string;
  previewUrl?: string;
}

export const sendDeparturePackEmail = async (
  input: SendDeparturePackInput
): Promise<SendDeparturePackResponse> => {
  const res = await apiClient.post('/email/send-itinerary', input);
  return res.data;
};

export const getIcsDownloadUrl = (tripId: number): string => {
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  return `${baseUrl}/email/trips/${tripId}/calendar.ics`;
};
