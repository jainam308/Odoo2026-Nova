import { Routes, Route } from 'react-router-dom';
import ItineraryBuilder from './ItineraryBuilder';
import ItineraryView from './ItineraryView';
import CalendarTimeline from './CalendarTimeline';
import PublicItinerary from './PublicItinerary';

export default function ItineraryRoutes() {
  return (
    <Routes>
      <Route path="/" element={<ItineraryBuilder />} />
      <Route path="/itinerary" element={<ItineraryBuilder />} />
      <Route path="/itinerary/:tripId/view" element={<ItineraryView />} />
      <Route path="/itinerary/:tripId/calendar" element={<CalendarTimeline />} />
      <Route path="/itinerary/public/:slug" element={<PublicItinerary />} />
    </Routes>
  );
}
