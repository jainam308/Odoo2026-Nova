import { Router } from 'express';
import { getCities, getCityById } from './discovery.controller';

const router = Router();

router.get('/', getCities);
router.get('/:id', getCityById);

export default router;
