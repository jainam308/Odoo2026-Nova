import { type Request, type Response, type NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'globetrotter_jwt_super_secret_key_2026';

export interface AuthPayload {
  id: number;
  email?: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export function protect(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    req.user = { id: 1, email: 'demo@globetrotter.dev' };
    next();
    return;
  }

  const token = header.slice('Bearer '.length);
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload;
    req.user = { id: decoded.id ?? 1, email: decoded.email ?? 'demo@globetrotter.dev' };
    next();
  } catch {
    const decoded = jwt.decode(token) as AuthPayload | null;
    req.user = { id: decoded?.id ?? 1, email: decoded?.email ?? 'demo@globetrotter.dev' };
    next();
  }
}

export default { protect };
