import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Card, Input, Button, Badge, LoadingSpinner } from '../../components';
import { Mail, Phone, MapPin, Edit3, CheckCircle, Calendar, Compass, Plus } from 'lucide-react';
import { fetchTrips } from '../../api/trips.api';
import { Trip } from '../../types/trip';
import { safeImageUrl } from '../../utils/safeUrl';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tripsLoading, setTripsLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [userTrips, setUserTrips] = useState<Trip[]>([]);

  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone: user?.phone || '',
    city: user?.city || '',
    country: user?.country || '',
    bio: user?.bio || '',
    photo_url: user?.photo_url || '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: user.phone || '',
        city: user.city || '',
        country: user.country || '',
        bio: user.bio || '',
        photo_url: user.photo_url || '',
      });
    }
  }, [user]);

  useEffect(() => {
    let ignore = false;
    const loadTrips = async () => {
      setTripsLoading(true);
      try {
        const allTrips = await fetchTrips();
        if (!ignore) {
          setUserTrips(allTrips);
        }
      } catch (err) {
        console.error('Failed to load user profile trips:', err);
      } finally {
        if (!ignore) setTripsLoading(false);
      }
    };
    loadTrips();
    return () => {
      ignore = true;
    };
  }, []);

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const plannedTrips = userTrips.filter((t) => {
    if (!t.end_date) return true;
    const end = new Date(t.end_date);
    end.setHours(23, 59, 59, 999);
    return end >= now;
  });

  const previousTrips = userTrips.filter((t) => {
    if (!t.end_date) return false;
    const end = new Date(t.end_date);
    end.setHours(23, 59, 59, 999);
    return end < now;
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage(null);
    try {
      await updateProfile(formData);
      setIsEditing(false);
      setSuccessMessage('Profile details updated successfully!');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const formatDates = (start?: string, end?: string) => {
    if (!start && !end) return 'Flexible Dates';
    if (start && !end) return `From ${start}`;
    return `${start} - ${end}`;
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '36px 24px', width: '100%' }}>
      {/* Success Notification */}
      {successMessage && (
        <div
          style={{
            backgroundColor: '#ECFDF5',
            border: '1px solid #A7F3D0',
            color: 'var(--color-success)',
            padding: '12px 18px',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '24px',
            fontWeight: 600,
            fontSize: '14px',
          }}
        >
          <CheckCircle size={18} />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Top Profile Card matching Screen 7 */}
      <Card style={{ padding: '32px', marginBottom: '36px' }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '24px',
          }}
        >
          {/* Avatar and User Details */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
            {user?.photo_url ? (
              <img
                src={safeImageUrl(user.photo_url)}
                alt="Profile"
                style={{
                  width: '96px',
                  height: '96px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '3px solid var(--color-primary)',
                  boxShadow: '0 4px 14px rgba(15, 110, 110, 0.2)',
                }}
              />
            ) : (
              <div
                style={{
                  width: '96px',
                  height: '96px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-primary)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '32px',
                  fontWeight: 800,
                  boxShadow: '0 4px 14px rgba(15, 110, 110, 0.2)',
                }}
              >
                {user?.first_name?.[0] || 'U'}
              </div>
            )}

            <div>
              <h1
                style={{
                  fontSize: '26px',
                  fontWeight: 800,
                  color: 'var(--color-primary)',
                  marginBottom: '6px',
                }}
              >
                {user?.first_name} {user?.last_name || ''}
              </h1>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', color: 'var(--color-text-muted)', fontSize: '13px', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Mail size={15} style={{ color: 'var(--color-primary)' }} />
                  <span>{user?.email || 'traveler@globetrotter.com'}</span>
                </div>
                {user?.phone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Phone size={15} style={{ color: 'var(--color-primary)' }} />
                    <span>{user.phone}</span>
                  </div>
                )}
                {(user?.city || user?.country) && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={15} style={{ color: 'var(--color-accent)' }} />
                    <span>{[user.city, user.country].filter(Boolean).join(', ')}</span>
                  </div>
                )}
              </div>

              {user?.bio && (
                <p style={{ fontSize: '14px', color: 'var(--color-text)', maxWidth: '600px', lineHeight: 1.5 }}>
                  {user.bio}
                </p>
              )}
            </div>
          </div>

          <Button
            variant={isEditing ? 'secondary' : 'primary'}
            size="md"
            leftIcon={<Edit3 size={16} />}
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Cancel Edit' : 'Edit Profile'}
          </Button>
        </div>

        {/* Edit Form Dropdown / Accordion */}
        {isEditing && (
          <form
            onSubmit={handleSave}
            style={{
              marginTop: '28px',
              paddingTop: '24px',
              borderTop: '1px solid var(--color-border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text)' }}>
              Update Profile Information
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
              <Input
                label="First Name"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                required
              />
              <Input
                label="Last Name"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              />
              <Input
                label="Phone Number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
              <Input
                label="City"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
              <Input
                label="Country"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              />
              <Input
                label="Avatar Image URL"
                value={formData.photo_url}
                onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text)' }}>
                About Me / Travel Bio
              </label>
              <textarea
                rows={3}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="accent" isLoading={loading}>
                Save Changes
              </Button>
            </div>
          </form>
        )}
      </Card>

      {/* Planned Trips Section matching Screen 7 */}
      <section style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <h2
            style={{
              fontSize: '22px',
              fontWeight: 800,
              color: 'var(--color-primary)',
              letterSpacing: '-0.02em',
            }}
          >
            Planned Trips ({plannedTrips.length})
          </h2>
          <Button size="sm" variant="secondary" leftIcon={<Plus size={14} />} onClick={() => navigate('/trips/new')}>
            New Trip
          </Button>
        </div>

        {tripsLoading ? (
          <LoadingSpinner label="Loading your trips..." />
        ) : plannedTrips.length === 0 ? (
          <Card style={{ padding: '32px', textAlign: 'center' }}>
            <Compass size={32} style={{ color: 'var(--color-text-muted)', margin: '0 auto 12px' }} />
            <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
              No active or upcoming trips planned yet.
            </p>
            <Button variant="accent" size="sm" onClick={() => navigate('/trips/new')}>
              Plan Your First Trip
            </Button>
          </Card>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {plannedTrips.map((trip) => {
              const stopNames = trip.stops?.map((s) => s.city_name || (s as any).name).filter(Boolean) || [];
              return (
                <Card key={trip.id} hoverable padding="none" style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ position: 'relative', width: '100%', height: '160px' }}>
                    <img
                      src={safeImageUrl(trip.cover_photo_url)}
                      alt={trip.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{ position: 'absolute', top: '10px', left: '10px' }}>
                      <Badge variant="upcoming">Upcoming</Badge>
                    </div>
                  </div>

                  <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text)' }}>
                      {trip.name}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--color-text-muted)' }}>
                      <Calendar size={14} />
                      <span>{formatDates(trip.start_date, trip.end_date)}</span>
                    </div>
                    {stopNames.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--color-text-muted)' }}>
                        <Compass size={14} />
                        <span>Stops: {stopNames.slice(0, 3).join(' → ')}</span>
                      </div>
                    )}

                    <div style={{ marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/trips/${trip.id}/builder`)}>
                        Edit
                      </Button>
                      <Button variant="primary" size="sm" onClick={() => navigate(`/trips/${trip.id}`)}>
                        View
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* Previous Trips Section matching Screen 7 */}
      <section>
        <h2
          style={{
            fontSize: '22px',
            fontWeight: 800,
            color: 'var(--color-primary)',
            letterSpacing: '-0.02em',
            marginBottom: '18px',
          }}
        >
          Previous Trips ({previousTrips.length})
        </h2>

        {tripsLoading ? (
          <LoadingSpinner label="Loading previous trips..." />
        ) : previousTrips.length === 0 ? (
          <Card style={{ padding: '24px', textAlign: 'center' }}>
            <p style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>
              No completed trips yet. Completed journeys will automatically appear here!
            </p>
          </Card>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {previousTrips.map((trip) => {
              const stopNames = trip.stops?.map((s) => s.city_name || (s as any).name).filter(Boolean) || [];
              return (
                <Card key={trip.id} hoverable padding="none" style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ position: 'relative', width: '100%', height: '160px' }}>
                    <img
                      src={safeImageUrl(trip.cover_photo_url)}
                      alt={trip.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{ position: 'absolute', top: '10px', left: '10px' }}>
                      <Badge variant="completed">Completed</Badge>
                    </div>
                  </div>

                  <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text)' }}>
                      {trip.name}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--color-text-muted)' }}>
                      <Calendar size={14} />
                      <span>{formatDates(trip.start_date, trip.end_date)}</span>
                    </div>
                    {stopNames.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--color-text-muted)' }}>
                        <Compass size={14} />
                        <span>Stops: {stopNames.slice(0, 3).join(' → ')}</span>
                      </div>
                    )}

                    <div style={{ marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end' }}>
                      <Button variant="secondary" size="sm" onClick={() => navigate(`/trips/${trip.id}`)}>
                        View
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default ProfilePage;
