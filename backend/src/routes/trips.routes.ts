import { Router } from 'express';
import { createTrip, getUserTrips, getTripById, updateTrip, deleteTrip } from '../modules/trips/trips.controller';

const router = Router();

router.post('/', createTrip);
router.get('/', getUserTrips);
router.get('/:id', getTripById);
router.put('/:id', updateTrip);
router.delete('/:id', deleteTrip);

export default router;