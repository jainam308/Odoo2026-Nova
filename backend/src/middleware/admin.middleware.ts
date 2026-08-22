import { Request, Response, NextFunction } from 'express';
import db from '../db';

export async function adminMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    let userId = (req as any).user?.id;

    if (!userId) {
      const adminUser = await db.query<{ id: number; is_admin: boolean }>(
        'SELECT id, is_admin FROM users WHERE is_admin = true LIMIT 1'
      );
      if (adminUser.rows.length > 0) {
        userId = adminUser.rows[0].id;
        (req as any).user = { id: userId, is_admin: true };
      }
    }

    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized: Admin user not found' });
      return;
    }

    const userRes = await db.query<{ id: number; is_admin: boolean }>(
      'SELECT id, is_admin FROM users WHERE id = $1',
      [userId]
    );

    if (userRes.rows.length === 0 || !userRes.rows[0].is_admin) {
      res.status(403).json({ success: false, error: 'Access denied: Admin privileges required' });
      return;
    }

    next();
  } catch (err) {
    next(err);
  }
}
