import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthUserPayload {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUserPayload;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUserPayload;
    }
  }
}

export function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: 'Authentication required. No token provided.',
    });
    return;
  }

  const token = authHeader.split(' ')[1];
  const jwtSecret = process.env.JWT_SECRET || 'globetrotter_fallback_secret_2026';

  try {
    const decoded = jwt.verify(token, jwtSecret) as AuthUserPayload;
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({
      success: false,
      error: 'Invalid or expired authentication token.',
    });
  }
}

export function optionalAuthMiddleware(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const jwtSecret = process.env.JWT_SECRET || 'globetrotter_fallback_secret_2026';
    try {
      const decoded = jwt.verify(token, jwtSecret) as AuthUserPayload;
      req.user = decoded;
    } catch {
      // ignore invalid token in optional mode
    }
  }
  next();
}

export const protect = authMiddleware;

export default authMiddleware;

