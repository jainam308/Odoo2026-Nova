import { Router } from 'express';
import {
  createTrip,
  getUserTrips,
  getTripById,
  getTripBySlug,
  updateTrip,
  deleteTrip,
  addTripStop,
  deleteTripStop,
  addStopActivity,
  deleteStopActivity,
  getTripBudget,
} from '../modules/trips/trips.controller';

const router = Router();

// Trips CRUD
router.post('/', createTrip);
router.get('/', getUserTrips);
router.get('/share/:slug', getTripBySlug);
router.get('/:id', getTripById);
router.put('/:id', updateTrip);
router.delete('/:id', deleteTrip);

// Stops
router.post('/:id/stops', addTripStop);
router.delete('/:id/stops/:stopId', deleteTripStop);

// Activities within Stop
router.post('/:id/stops/:stopId/activities', addStopActivity);
router.delete('/:id/stops/:stopId/activities/:activityId', deleteStopActivity);

// Budget Metrics
router.get('/:id/budget', getTripBudget);

export default router;