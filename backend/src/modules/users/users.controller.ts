import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import db from '../../db';
import { updateProfileSchema } from '../auth/auth.validation';
import { UserRecord } from '../auth/auth.controller';

export const getMe = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;

    const result = await db.query<Omit<UserRecord, 'password_hash'>>(
      `SELECT id, first_name, last_name, email, phone, city, country, bio, photo_url, created_at
       FROM users
       WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: 'User not found.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

export const updateMe = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const parseResult = updateProfileSchema.safeParse(req.body);

    if (!parseResult.success) {
      const errorMessage = parseResult.error.issues.map((e) => e.message).join(', ');
      res.status(400).json({ success: false, error: errorMessage });
      return;
    }

    const { first_name, last_name, phone, city, country, bio, photo_url } = parseResult.data;

    // Fetch current user to preserve unchanged fields
    const current = await db.query<UserRecord>(
      'SELECT * FROM users WHERE id = $1',
      [userId]
    );

    if (current.rows.length === 0) {
      res.status(404).json({ success: false, error: 'User not found.' });
      return;
    }

    const cur = current.rows[0];

    const result = await db.query<Omit<UserRecord, 'password_hash'>>(
      `UPDATE users
       SET first_name = COALESCE($1, first_name),
           last_name = COALESCE($2, last_name),
           phone = COALESCE($3, phone),
           city = COALESCE($4, city),
           country = COALESCE($5, country),
           bio = COALESCE($6, bio),
           photo_url = COALESCE($7, photo_url)
       WHERE id = $8
       RETURNING id, first_name, last_name, email, phone, city, country, bio, photo_url, created_at`,
      [
        first_name ?? cur.first_name,
        last_name !== undefined ? last_name : cur.last_name,
        phone !== undefined ? phone : cur.phone,
        city !== undefined ? city : cur.city,
        country !== undefined ? country : cur.country,
        bio !== undefined ? bio : cur.bio,
        photo_url !== undefined ? photo_url : cur.photo_url,
        userId,
      ]
    );

    res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
};
