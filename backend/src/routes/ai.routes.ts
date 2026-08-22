import { Router } from 'express';
import { planTripWithAI } from '../modules/ai/ai.controller';

const router = Router();

// POST /api/ai/plan - Generate structured AI trip plan
router.post('/plan', planTripWithAI);

export default router;
