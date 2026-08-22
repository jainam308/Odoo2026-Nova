import { Request, Response, NextFunction } from 'express';
import db from '../db';

export async function adminMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized: Authentication required' });
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
