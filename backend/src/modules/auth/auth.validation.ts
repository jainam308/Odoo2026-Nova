import { z } from 'zod';

export const signupSchema = z.object({
  first_name: z.string().min(1, 'First name is required').max(100),
  last_name: z.string().max(100).optional().default(''),
  email: z.string().email('Please provide a valid email address').max(255),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  phone: z.string().max(20).optional().default(''),
  city: z.string().max(100).optional().default(''),
  country: z.string().max(100).optional().default(''),
  bio: z.string().optional().default(''),
  photo_url: z.string().url().optional().or(z.literal('')),
});

export const loginSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
  first_name: z.string().min(1).max(100).optional(),
  last_name: z.string().max(100).optional(),
  phone: z.string().max(20).optional(),
  city: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  bio: z.string().optional(),
  photo_url: z.string().url().optional().or(z.literal('')),
});
