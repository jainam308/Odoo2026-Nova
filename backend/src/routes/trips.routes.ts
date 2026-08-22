import { Router } from 'express';
import {
  createTrip,
  getUserTrips,
  getTripById,
  getTripBySlug,
  updateTrip,
  deleteTrip,
  getTripStops,
  addTripStop,
  deleteTripStop,
  reorderTripStops,
  addStopActivity,
  deleteStopActivity,
  getTripBudget,
} from '../modules/trips/trips.controller';

import { optionalAuthMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Apply optionalAuthMiddleware across all trip routes
router.use(optionalAuthMiddleware);

// Trips CRUD
router.post('/', createTrip);
router.get('/', getUserTrips);
router.get('/share/:slug', getTripBySlug);
router.get('/:id', getTripById);
router.put('/:id', updateTrip);
router.delete('/:id', deleteTrip);

// Stops
router.get('/:id/stops', getTripStops);
router.post('/:id/stops', addTripStop);
router.put('/:id/stops/reorder', reorderTripStops);
router.delete('/:id/stops/:stopId', deleteTripStop);

// Activities within Stop
router.post('/:id/stops/:stopId/activities', addStopActivity);
router.delete('/:id/stops/:stopId/activities/:activityId', deleteStopActivity);

// Budget Metrics
router.get('/:id/budget', getTripBudget);

export default router;