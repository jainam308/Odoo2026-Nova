import { Request, Response, NextFunction } from 'express';

type Entry = {
  count: number;
  resetAt: number;
};

const store = new Map<string, Entry>();

export function authRouteRateLimit(req: Request, res: Response, next: NextFunction): void {
  const windowMs = 60_000;
  const maxRequests = 120;
  const now = Date.now();
  const key = req.ip || req.socket.remoteAddress || 'unknown';
  const current = store.get(key);

  if (!current || now > current.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    next();
    return;
  }

  if (current.count >= maxRequests) {
    res.status(429).json({
      success: false,
      error: 'Too many requests. Please try again shortly.',
    });
    return;
  }

  current.count += 1;
  store.set(key, current);
  next();
}
