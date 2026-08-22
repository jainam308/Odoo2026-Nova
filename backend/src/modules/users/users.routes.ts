import { Router } from 'express';
import { getMe, updateMe } from './users.controller';
import authMiddleware from '../../middleware/auth.middleware';

const router = Router();

router.get('/me', authMiddleware, getMe);
router.put('/me', authMiddleware, updateMe);

export default router;
