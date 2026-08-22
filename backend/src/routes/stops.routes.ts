import { Router } from 'express';
import { protect } from '../middleware/auth.middleware';
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
router.get('/trips', protect, getTripsReadOnly);
router.get('/cities', getCitiesReadOnly);
router.get('/activities', getActivitiesReadOnly);

// All Module C stops routes are protected (Module A's JWT middleware).
router.post('/trips/:tripId/stops', protect, createStop);
router.get('/trips/:tripId/stops', protect, getStops);
router.put('/stops/:id', protect, updateStop);
router.delete('/stops/:id', protect, deleteStop);

// Stop activities (protected).
router.post('/stops/:stopId/activities', protect, createStopActivity);
router.put('/stop-activities/:id', protect, updateStopActivity);
router.delete('/stop-activities/:id', protect, deleteStopActivity);

// Budget summary (protected).
router.get('/trips/:tripId/budget-summary', protect, getBudgetSummary);

// Public, unauthenticated share view.
router.get('/public/trips/:slug', getPublicTrip);

// Public share copy action (protected).
router.post('/public/trips/:slug/copy', protect, copyPublicTrip);

export default router;
