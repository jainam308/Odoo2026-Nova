import { Router } from 'express';
import { optionalAuthMiddleware } from '../middleware/auth.middleware';
import {
  sendItineraryEmail,
  downloadTripIcs,
  triggerWelcomeTestEmail,
} from '../modules/email/email.controller';

const router = Router();

// Apply optional auth so logged-in user name is attached if available
router.use(optionalAuthMiddleware);

router.post('/send-itinerary', sendItineraryEmail);
router.get('/trips/:id/calendar.ics', downloadTripIcs);
router.post('/welcome-test', triggerWelcomeTestEmail);

export default router;
