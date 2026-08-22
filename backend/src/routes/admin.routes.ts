import { Router } from 'express';
import { adminMiddleware } from '../middleware/admin.middleware';
import {
  getStats,
  getAnalytics,
  getAllUsers,
  updateUser,
  deleteUser,
  getAllTrips,
  updateTrip,
  deleteTrip,
  createCity,
  updateCity,
  deleteCity,
  createActivity,
  deleteActivity,
} from '../modules/admin/admin.controller';

const router = Router();

// Apply admin protection middleware
router.use(adminMiddleware);

// Admin System Overview Stats & Analytics
router.get('/stats', getStats);
router.get('/analytics', getAnalytics);

// User Management
router.get('/users', getAllUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Trip Management
router.get('/trips', getAllTrips);
router.put('/trips/:id', updateTrip);
router.delete('/trips/:id', deleteTrip);

// Destination & Activity Management
router.post('/cities', createCity);
router.put('/cities/:id', updateCity);
router.delete('/cities/:id', deleteCity);
router.post('/activities', createActivity);
router.delete('/activities/:id', deleteActivity);

export default router;
