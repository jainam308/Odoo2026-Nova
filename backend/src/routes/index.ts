import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes';
import usersRoutes from '../modules/users/users.routes';
import citiesRoutes from '../modules/discovery/cities.routes';
import activitiesRoutes from '../modules/discovery/activities.routes';
import tripsRouter from './trips.routes';
import aiRoutes from './ai.routes';
import communityRoutes from './community.routes';
import emailRoutes from './email.routes';

const router = Router();

// Module A – Authentication & Discovery
router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/cities', citiesRoutes);
router.use('/activities', activitiesRoutes);

// Module B – Trip Itinerary Builder
router.use('/trips', tripsRouter);

// AI Module – Trip Planning Assistant
router.use('/ai', aiRoutes);

// Community Module – Share Travel Experiences
router.use('/community', communityRoutes);

// Email & Calendar Sync Service
router.use('/email', emailRoutes);

export default router;
