import { Router } from 'express';
import { getMe, updateMe } from './users.controller';
import authMiddleware from '../../middleware/auth.middleware';
import { authRouteRateLimit } from '../../middleware/rateLimit.middleware';

const router = Router();

router.get('/me', authRouteRateLimit, authMiddleware, getMe);
router.put('/me', authRouteRateLimit, authMiddleware, updateMe);

export default router;
