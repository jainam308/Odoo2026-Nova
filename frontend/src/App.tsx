import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ItineraryRoutes from './pages/itinerary/ItineraryRoutes';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <main>
          <ItineraryRoutes />
        </main>
      </AuthProvider>
    </BrowserRouter>
  );
}
