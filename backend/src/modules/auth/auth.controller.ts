import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../../db';
import { signupSchema, loginSchema, googleAuthSchema } from './auth.validation';

export interface UserRecord {
  id: number;
  first_name: string;
  last_name: string | null;
  email: string;
  password_hash: string;
  phone: string | null;
  city: string | null;
  country: string | null;
  photo_url: string | null;
  bio: string | null;
  is_admin: boolean;
  created_at: Date;
}

function isUiAvatarHost(value: string | null | undefined): boolean {
  if (!value) return false;
  try {
    return new URL(value).hostname === 'ui-avatars.com';
  } catch {
    return false;
  }
}

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const parseResult = signupSchema.safeParse(req.body);
    if (!parseResult.success) {
      const errorMessage = parseResult.error.issues.map((e) => e.message).join(', ');
      res.status(400).json({ success: false, error: errorMessage });
      return;
    }

    const { first_name, last_name, email, password, phone, city, country, bio, photo_url } = parseResult.data;

    // Check for existing user by email
    const existing = await db.query<UserRecord>(
      'SELECT id FROM users WHERE LOWER(email) = LOWER($1)',
      [email]
    );

    if (existing.rows.length > 0) {
      res.status(400).json({
        success: false,
        error: 'An account with this email address already exists.',
      });
      return;
    }

    // Hash password with bcrypt (10 salt rounds)
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    const defaultAvatar =
      photo_url ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(first_name + ' ' + (last_name || ''))}&background=0F6E6E&color=fff&bold=true`;

    const result = await db.query<UserRecord>(
      `INSERT INTO users (first_name, last_name, email, password_hash, phone, city, country, bio, photo_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, first_name, last_name, email, phone, city, country, bio, photo_url, created_at`,
      [first_name, last_name, email.toLowerCase(), password_hash, phone, city, country, bio, defaultAvatar]
    );

    const user = result.rows[0];

    const jwtSecret = process.env.JWT_SECRET || 'globetrotter_fallback_secret_2026';
    const token = jwt.sign(
      { id: user.id, email: user.email, first_name: user.first_name, last_name: user.last_name },
      jwtSecret,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      data: {
        user,
        token,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      const errorMessage = parseResult.error.issues.map((e) => e.message).join(', ');
      res.status(400).json({ success: false, error: errorMessage });
      return;
    }

    const { email, password } = parseResult.data;

    const result = await db.query<UserRecord>(
      `SELECT id, first_name, last_name, email, password_hash, phone, city, country, bio, photo_url, COALESCE(is_admin, false) AS is_admin, created_at
       FROM users
       WHERE LOWER(email) = LOWER($1)`,
      [email]
    );

    if (result.rows.length === 0) {
      res.status(401).json({
        success: false,
        error: 'Invalid email or password.',
      });
      return;
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        error: 'Invalid email or password.',
      });
      return;
    }

    // Do not leak password_hash to client
    const { password_hash: _, ...safeUser } = user;

    const jwtSecret = process.env.JWT_SECRET || 'globetrotter_fallback_secret_2026';
    const token = jwt.sign(
      { id: safeUser.id, email: safeUser.email, first_name: safeUser.first_name, last_name: safeUser.last_name },
      jwtSecret,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      data: {
        user: safeUser,
        token,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const googleLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const parseResult = googleAuthSchema.safeParse(req.body);
    if (!parseResult.success) {
      const errorMessage = parseResult.error.issues.map((e) => e.message).join(', ');
      res.status(400).json({ success: false, error: errorMessage });
      return;
    }

    const { email, first_name, last_name, photo_url } = parseResult.data;

    // Check if user already exists
    const existing = await db.query<UserRecord>(
      `SELECT id, first_name, last_name, email, password_hash, phone, city, country, bio, photo_url, COALESCE(is_admin, false) AS is_admin, created_at
       FROM users
       WHERE LOWER(email) = LOWER($1)`,
      [email]
    );

    let user: Omit<UserRecord, 'password_hash'>;

    if (existing.rows.length > 0) {
      const existingUser = existing.rows[0];
      // Update avatar if provided
      if (photo_url && (!existingUser.photo_url || isUiAvatarHost(existingUser.photo_url))) {
        await db.query('UPDATE users SET photo_url = $1 WHERE id = $2', [photo_url, existingUser.id]);
        existingUser.photo_url = photo_url;
      }
      const { password_hash: _, ...safeUser } = existingUser;
      user = safeUser;
    } else {
      // Auto-provision new Google account
      const randomPassword = 'GoogleAuth_' + Math.random().toString(36).slice(-12) + '!A1';
      const password_hash = await bcrypt.hash(randomPassword, 10);
      const defaultAvatar =
        photo_url ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(first_name + ' ' + (last_name || ''))}&background=0F6E6E&color=fff&bold=true`;

      const insertResult = await db.query<UserRecord>(
        `INSERT INTO users (first_name, last_name, email, password_hash, photo_url, bio)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, first_name, last_name, email, phone, city, country, bio, photo_url, created_at`,
        [first_name, last_name, email.toLowerCase(), password_hash, defaultAvatar, 'Exploring the world via GlobeTrotter Google account']
      );
      user = insertResult.rows[0];
    }

    const jwtSecret = process.env.JWT_SECRET || 'globetrotter_fallback_secret_2026';
    const token = jwt.sign(
      { id: user.id, email: user.email, first_name: user.first_name, last_name: user.last_name },
      jwtSecret,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      data: {
        user,
        token,
      },
    });
  } catch (err) {
    next(err);
  }
};
