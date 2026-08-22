import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { discoveryApi, City } from '../../api/discovery.api';
import { useAuth } from '../../context/AuthContext';
import { Card, Button, Badge, LoadingSpinner } from '../../components';
import { Search, Compass, MapPin, Calendar, Sparkles, ArrowRight, DollarSign } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchTopCities = async () => {
      try {
        const data = await discoveryApi.getCities();
        setCities(data);
      } catch (err) {
        console.error('Failed to load cities:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTopCities();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/discover?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/discover');
    }
  };

  const sampleTrips = [
    {
      id: 1,
      name: 'European Summer Odyssey',
      description: 'Paris, Rome, Barcelona • 15 Days',
      image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=600&q=80',
      status: 'upcoming',
      dates: 'Jun 10 - Jun 25, 2026',
      stops: 3,
    },
    {
      id: 2,
      name: 'Japan Wonders: Tokyo to Kyoto',
      description: 'Tokyo, Kyoto, Osaka • 14 Days',
      image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&q=80',
      status: 'upcoming',
      dates: 'Oct 01 - Oct 14, 2026',
      stops: 3,
    },
  ];

  return (
    <div style={{ width: '100%', paddingBottom: '64px' }}>
      {/* 1. Hero Banner Image matching Screen 3 */}
      <section
        style={{
          position: 'relative',
          width: '100%',
          minHeight: '440px',
          backgroundImage:
            'linear-gradient(rgba(15, 110, 110, 0.65), rgba(10, 79, 79, 0.85)), url(https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1600&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          padding: '48px 24px',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '840px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(8px)',
              padding: '6px 16px',
              borderRadius: '9999px',
              fontSize: '13px',
              fontWeight: 600,
              marginBottom: '18px',
            }}
          >
            <Sparkles size={16} style={{ color: 'var(--color-accent)' }} />
            <span>Smart Multi-City Itinerary Architect</span>
          </div>

          <h1
            style={{
              fontSize: '44px',
              fontWeight: 800,
              lineHeight: 1.15,
              marginBottom: '16px',
              letterSpacing: '-0.03em',
            }}
          >
            Design Your Next Adventure Across The World
          </h1>

          <p
            style={{
              fontSize: '18px',
              color: 'rgba(255, 255, 255, 0.9)',
              maxWidth: '620px',
              marginBottom: '32px',
              fontWeight: 400,
            }}
          >
            Seamlessly plan multi-city stops, curate local activities, track budgets, and share interactive journeys.
          </p>

          {/* Quick Search on Banner */}
          <form
            onSubmit={handleSearch}
            style={{
              width: '100%',
              maxWidth: '560px',
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#ffffff',
              borderRadius: 'var(--radius-lg)',
              padding: '6px 8px 6px 16px',
              boxShadow: '0 12px 30px rgba(0, 0, 0, 0.25)',
            }}
          >
            <Search size={20} style={{ color: 'var(--color-text-muted)', marginRight: '10px' }} />
            <input
              type="text"
              placeholder="Search cities, countries, or activities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                fontSize: '15px',
                color: 'var(--color-text)',
              }}
            />
            <Button type="submit" variant="accent" size="md">
              Search
            </Button>
          </form>
        </div>
      </section>

      {/* Main Content Area */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '48px 24px' }}>
        {/* 2. Top Regional Destinations matching Screen 3 */}
        <section style={{ marginBottom: '56px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '24px',
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: '24px',
                  fontWeight: 800,
                  color: 'var(--color-primary)',
                  letterSpacing: '-0.02em',
                }}
              >
                Top Regional Destinations
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>
                Handpicked iconic spots tailored for unforgettable multi-city itineraries
              </p>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/discover')}
              rightIcon={<ArrowRight size={14} />}
            >
              View All
            </Button>
          </div>

          {loading ? (
            <LoadingSpinner text="Loading top destinations..." />
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: '20px',
              }}
            >
              {cities.slice(0, 8).map((city) => (
                <Card
                  key={city.id}
                  hoverable
                  padding="none"
                  onClick={() => navigate(`/discover?city_id=${city.id}`)}
                  style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
                >
                  <div style={{ position: 'relative', width: '100%', height: '180px' }}>
                    <img
                      src={city.image_url || 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80'}
                      alt={city.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(4px)',
                        padding: '3px 8px',
                        borderRadius: '9999px',
                        fontSize: '11px',
                        fontWeight: 700,
                        color: 'var(--color-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2px',
                      }}
                    >
                      <DollarSign size={12} />
                      <span>Cost: {'$'.repeat(city.cost_index || 3)}</span>
                    </div>
                  </div>

                  <div style={{ padding: '16px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text)', marginBottom: '4px' }}>
                      {city.name}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-text-muted)', fontSize: '13px' }}>
                      <MapPin size={14} style={{ color: 'var(--color-accent)' }} />
                      <span>{city.country}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* 3. Previous / Active Trips matching Screen 3 */}
        <section>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '24px',
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: '24px',
                  fontWeight: 800,
                  color: 'var(--color-primary)',
                  letterSpacing: '-0.02em',
                }}
              >
                {user ? 'Your Planned Trips' : 'Featured Community Journeys'}
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>
                {user ? 'Jump straight back into your saved itineraries' : 'Explore popular journeys designed by world travelers'}
              </p>
            </div>

            <Button
              variant="accent"
              size="sm"
              onClick={() => navigate('/trips')}
            >
              Open Trips Hub
            </Button>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
              gap: '24px',
            }}
          >
            {sampleTrips.map((trip) => (
              <Card
                key={trip.id}
                hoverable
                padding="none"
                style={{ display: 'flex', flexDirection: 'column' }}
              >
                <div style={{ position: 'relative', width: '100%', height: '190px' }}>
                  <img
                    src={trip.image}
                    alt={trip.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{ position: 'absolute', top: '12px', left: '12px' }}>
                    <Badge variant={trip.status}>{trip.status}</Badge>
                  </div>
                </div>

                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text)' }}>
                    {trip.name}
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                    {trip.description}
                  </p>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: '10px',
                      borderTop: '1px solid var(--color-border)',
                      fontSize: '12px',
                      color: 'var(--color-text-muted)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Calendar size={14} />
                      <span>{trip.dates}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Compass size={14} />
                      <span>{trip.stops} Stops</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default DashboardPage;
