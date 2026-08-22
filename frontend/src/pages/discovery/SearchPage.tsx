import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { discoveryApi, City, Activity } from '../../api/discovery.api';
import { SearchListLayout, Card, Badge, Button, LoadingSpinner, EmptyState } from '../../components';
import { MapPin, Clock, Filter } from 'lucide-react';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const initialCityId = searchParams.get('city_id') || '';

  const [activeTab, setActiveTab] = useState<'activities' | 'cities'>('activities');
  const [searchValue, setSearchValue] = useState(initialSearch);
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedCityId, setSelectedCityId] = useState<string>(initialCityId);

  const [cities, setCities] = useState<City[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const filterOptions = [
    { id: 'all', label: 'All Categories' },
    { id: 'sightseeing', label: 'Sightseeing' },
    { id: 'food', label: 'Food & Dining' },
    { id: 'adventure', label: 'Adventure' },
    { id: 'nightlife', label: 'Nightlife' },
    { id: 'culture', label: 'Culture & Heritage' },
  ];

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const cityList = await discoveryApi.getCities();
        setCities(cityList);
      } catch (err) {
        console.error('Error loading cities:', err);
      }
    };
    fetchCities();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (activeTab === 'activities') {
          const acts = await discoveryApi.getActivities(selectedCityId || undefined, activeCategory, searchValue);
          setActivities(acts);
        } else {
          const cts = await discoveryApi.getCities(searchValue);
          setCities(cts);
        }
      } catch (err) {
        console.error('Error searching data:', err);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchData, 250);
    return () => clearTimeout(debounce);
  }, [activeTab, searchValue, activeCategory, selectedCityId]);

  return (
    <SearchListLayout
      title={activeTab === 'activities' ? 'Explore Local Experiences & Activities' : 'Discover Global Destination Cities'}
      subtitle="Find curated activities, iconic landmarks, and hidden gems across premier global destinations"
      searchValue={searchValue}
      onSearchChange={(val) => {
        setSearchValue(val);
        setSearchParams(val ? { search: val } : {});
      }}
      searchPlaceholder={activeTab === 'activities' ? 'Search activities, e.g. sushi, Eiffel tower, hike...' : 'Search cities, e.g. Tokyo, Paris, Bali...'}
      filterOptions={activeTab === 'activities' ? filterOptions : []}
      activeFilter={activeCategory}
      onFilterChange={(filterId) => setActiveCategory(filterId)}
      actions={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#ffffff', padding: '4px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
          <button
            onClick={() => setActiveTab('activities')}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '13px',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeTab === 'activities' ? 'var(--color-primary)' : 'transparent',
              color: activeTab === 'activities' ? '#ffffff' : 'var(--color-text-muted)',
              transition: 'all 0.2s ease',
            }}
          >
            Activities
          </button>
          <button
            onClick={() => setActiveTab('cities')}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '13px',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeTab === 'cities' ? 'var(--color-primary)' : 'transparent',
              color: activeTab === 'cities' ? '#ffffff' : 'var(--color-text-muted)',
              transition: 'all 0.2s ease',
            }}
          >
            Cities
          </button>
        </div>
      }
    >
      {/* City Selector Pill Bar (when searching activities) */}
      {activeTab === 'activities' && cities.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', paddingBottom: '16px', marginBottom: '16px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
            <Filter size={14} /> City:
          </span>
          <button
            onClick={() => setSelectedCityId('')}
            style={{
              padding: '4px 12px',
              borderRadius: '9999px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              border: selectedCityId === '' ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
              backgroundColor: selectedCityId === '' ? 'var(--color-primary-light)' : '#ffffff',
              color: selectedCityId === '' ? 'var(--color-primary)' : 'var(--color-text)',
              flexShrink: 0,
            }}
          >
            All Cities
          </button>
          {cities.map((city) => (
            <button
              key={city.id}
              onClick={() => setSelectedCityId(String(city.id))}
              style={{
                padding: '4px 12px',
                borderRadius: '9999px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                border: selectedCityId === String(city.id) ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
                backgroundColor: selectedCityId === String(city.id) ? 'var(--color-primary-light)' : '#ffffff',
                color: selectedCityId === String(city.id) ? 'var(--color-primary)' : 'var(--color-text)',
                flexShrink: 0,
              }}
            >
              {city.name}
            </button>
          ))}
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <LoadingSpinner text={`Searching ${activeTab}...`} />
      ) : activeTab === 'activities' ? (
        activities.length === 0 ? (
          <EmptyState
            title="No activities found"
            description="We couldn't find any activities matching your filters. Try clearing your search term or picking another category."
            actionText="Reset Filters"
            onAction={() => {
              setSearchValue('');
              setActiveCategory('all');
              setSelectedCityId('');
            }}
          />
        ) : (
          /* List of Activity Cards matching Screen 8 */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {activities.map((act) => (
              <Card
                key={act.id}
                hoverable
                padding="none"
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  alignItems: 'stretch',
                }}
              >
                <div style={{ width: '220px', minHeight: '160px', flexShrink: 0, position: 'relative' }}>
                  <img
                    src={act.image_url || 'https://images.unsplash.com/photo-1543349689-9a4d426bee8e?auto=format&fit=crop&w=400&q=80'}
                    alt={act.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{ position: 'absolute', top: '10px', left: '10px' }}>
                    <Badge variant={act.category}>{act.category}</Badge>
                  </div>
                </div>

                <div
                  style={{
                    flex: 1,
                    minWidth: '280px',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '12px',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '4px' }}>
                      <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text)' }}>
                        {act.name}
                      </h3>
                      <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-primary)' }}>
                        {Number(act.cost) === 0 ? 'Free' : `$${act.cost}`}
                      </span>
                    </div>

                    {act.city_name && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
                        <MapPin size={14} style={{ color: 'var(--color-accent)' }} />
                        <span>{act.city_name}, {act.city_country}</span>
                      </div>
                    )}

                    <p style={{ fontSize: '14px', color: 'var(--color-text)', lineHeight: 1.5 }}>
                      {act.description}
                    </p>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderTop: '1px solid var(--color-border)',
                      paddingTop: '12px',
                    }}
                  >
                    {act.duration_minutes ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--color-text-muted)' }}>
                        <Clock size={14} />
                        <span>{act.duration_minutes} mins</span>
                      </div>
                    ) : <div />}

                    <Button variant="primary" size="sm">
                      Details & Schedule
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )
      ) : (
        /* Cities Grid */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {cities.map((city) => (
            <Card
              key={city.id}
              hoverable
              padding="none"
              onClick={() => {
                setActiveTab('activities');
                setSelectedCityId(String(city.id));
              }}
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
                  }}
                >
                  Popularity: {city.popularity}%
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
    </SearchListLayout>
  );
};

export default SearchPage;
