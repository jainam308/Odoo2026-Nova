import { z } from 'zod';

// Strict Real-World Validation Regexes
const phoneRegex = /^\+?[0-9]{10,15}$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

export const signupSchema = z.object({
  first_name: z
    .string()
    .trim()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name cannot exceed 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'First name can only contain letters, spaces, hyphens, and apostrophes'),
  last_name: z
    .string()
    .trim()
    .max(50, 'Last name cannot exceed 50 characters')
    .regex(/^[a-zA-Z\s'-]*$/, 'Last name can only contain letters, spaces, hyphens, and apostrophes')
    .optional()
    .default(''),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Please provide a valid email address (e.g. name@domain.com)')
    .max(255, 'Email cannot exceed 255 characters'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .max(128, 'Password cannot exceed 128 characters')
    .regex(
      passwordRegex,
      'Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special symbol (@$!%*?&#^)'
    ),
  phone: z
    .string()
    .trim()
    .transform((val) => val.replace(/[\s\-\(\)]/g, ''))
    .refine((val) => val === '' || phoneRegex.test(val), {
      message: 'Phone number must contain at least 10 digits (e.g. +14155552671 or 9876543210)',
    })
    .optional()
    .default(''),
  city: z
    .string()
    .trim()
    .max(100, 'City cannot exceed 100 characters')
    .optional()
    .default(''),
  country: z
    .string()
    .trim()
    .max(100, 'Country cannot exceed 100 characters')
    .optional()
    .default(''),
  bio: z
    .string()
    .trim()
    .max(500, 'Bio cannot exceed 500 characters')
    .optional()
    .default(''),
  photo_url: z
    .string()
    .trim()
    .url('Photo URL must be a valid web address')
    .optional()
    .or(z.literal('')),
});

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required'),
});

export const googleAuthSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Invalid Google email address'),
  first_name: z
    .string()
    .trim()
    .min(1, 'First name is required')
    .max(50)
    .default('Traveler'),
  last_name: z
    .string()
    .trim()
    .max(50)
    .optional()
    .default(''),
  photo_url: z
    .string()
    .url()
    .optional()
    .or(z.literal('')),
  google_id: z
    .string()
    .optional(),
});

export const updateProfileSchema = z.object({
  first_name: z
    .string()
    .trim()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name cannot exceed 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'First name can only contain letters, spaces, hyphens, and apostrophes')
    .optional(),
  last_name: z
    .string()
    .trim()
    .max(50, 'Last name cannot exceed 50 characters')
    .regex(/^[a-zA-Z\s'-]*$/, 'Last name can only contain letters, spaces, hyphens, and apostrophes')
    .optional(),
  phone: z
    .string()
    .trim()
    .transform((val) => val.replace(/[\s\-\(\)]/g, ''))
    .refine((val) => val === '' || phoneRegex.test(val), {
      message: 'Phone number must contain at least 10 digits (e.g. +14155552671 or 9876543210)',
    })
    .optional(),
  city: z
    .string()
    .trim()
    .max(100)
    .optional(),
  country: z
    .string()
    .trim()
    .max(100)
    .optional(),
  bio: z
    .string()
    .trim()
    .max(500, 'Bio cannot exceed 500 characters')
    .optional(),
  photo_url: z
    .string()
    .trim()
    .url('Photo URL must be a valid web address')
    .optional()
    .or(z.literal('')),
});
