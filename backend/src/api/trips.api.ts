import axios from 'axios';
import dotenv from 'dotenv';
import type { Trip, CreateTripInput } from '../types/trip';

dotenv.config();

const api = axios.create({
  baseURL: process.env.VITE_API_URL || 'http://localhost:5000/api',
});

export const fetchTrips = async (): Promise<Trip[]> => {
  const res = await api.get('/trips');
  return res.data.data;
};

export const createTrip = async (data: CreateTripInput): Promise<Trip> => {
  const res = await api.post('/trips', data);
  return res.data.trip;
};

export const deleteTrip = async (id: number): Promise<boolean> => {
  const res = await api.delete(`/trips/${id}`);
  return res.data.deleted;
};