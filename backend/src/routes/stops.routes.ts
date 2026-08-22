import { Router } from 'express';
import { protect } from '../middleware/auth.middleware';
import { authRouteRateLimit } from '../middleware/rateLimit.middleware';
import {
  getTripsReadOnly,
  getCitiesReadOnly,
  getActivitiesReadOnly,
  createStop,
  getStops,
  updateStop,
  deleteStop,
  createStopActivity,
  updateStopActivity,
  deleteStopActivity,
  getBudgetSummary,
  getPublicTrip,
  copyPublicTrip,
} from '../modules/itinerary.controller';

const router = Router();

// Read-only cross-module helper endpoints (Module A/B fallbacks for Module C preview)
router.get('/trips', authRouteRateLimit, protect, getTripsReadOnly);
router.get('/cities', getCitiesReadOnly);
router.get('/activities', getActivitiesReadOnly);

// All Module C stops routes are protected (Module A's JWT middleware).
router.post('/trips/:tripId/stops', authRouteRateLimit, protect, createStop);
router.get('/trips/:tripId/stops', authRouteRateLimit, protect, getStops);
router.put('/stops/:id', authRouteRateLimit, protect, updateStop);
router.delete('/stops/:id', authRouteRateLimit, protect, deleteStop);

// Stop activities (protected).
router.post('/stops/:stopId/activities', authRouteRateLimit, protect, createStopActivity);
router.put('/stop-activities/:id', authRouteRateLimit, protect, updateStopActivity);
router.delete('/stop-activities/:id', authRouteRateLimit, protect, deleteStopActivity);

// Budget summary (protected).
router.get('/trips/:tripId/budget-summary', authRouteRateLimit, protect, getBudgetSummary);

// Public, unauthenticated share view.
router.get('/public/trips/:slug', getPublicTrip);

// Public share copy action (protected).
router.post('/public/trips/:slug/copy', authRouteRateLimit, protect, copyPublicTrip);

export default router;
