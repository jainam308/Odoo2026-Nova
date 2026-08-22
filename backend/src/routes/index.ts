import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes';
import usersRoutes from '../modules/users/users.routes';
import citiesRoutes from '../modules/discovery/cities.routes';
import activitiesRoutes from '../modules/discovery/activities.routes';

const router = Router();

// Module A routes
router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/cities', citiesRoutes);
router.use('/activities', activitiesRoutes);

export default router;
