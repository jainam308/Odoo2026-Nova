import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, Input, Button, Badge } from '../../components';
import { Mail, Phone, MapPin, Edit3, CheckCircle, Calendar, Compass } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone: user?.phone || '',
    city: user?.city || '',
    country: user?.country || '',
    bio: user?.bio || '',
    photo_url: user?.photo_url || '',
  });

  const plannedTrips = [
    {
      id: 1,
      name: 'European Summer Odyssey',
      dates: 'Jun 10 - Jun 25, 2026',
      stops: ['Paris', 'Rome', 'Barcelona'],
      image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=500&q=80',
      status: 'upcoming',
    },
    {
      id: 2,
      name: 'Japan Wonders: Tokyo to Kyoto',
      dates: 'Oct 01 - Oct 14, 2026',
      stops: ['Tokyo', 'Kyoto', 'Osaka'],
      image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=500&q=80',
      status: 'upcoming',
    },
  ];

  const previousTrips = [
    {
      id: 3,
      name: 'South African Safari & Cape Town',
      dates: 'Jan 15 - Jan 28, 2025',
      stops: ['Cape Town', 'Kruger National Park'],
      image: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=500&q=80',
      status: 'completed',
    },
    {
      id: 4,
      name: 'Tropical Bali Retreat',
      dates: 'Aug 04 - Aug 18, 2024',
      stops: ['Ubud', 'Canggu', 'Nusa Penida'],
      image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=500&q=80',
      status: 'completed',
    },
  ];

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
                src={user.photo_url}
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
        <h2
          style={{
            fontSize: '22px',
            fontWeight: 800,
            color: 'var(--color-primary)',
            letterSpacing: '-0.02em',
            marginBottom: '18px',
          }}
        >
          Planned Trips
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {plannedTrips.map((trip) => (
            <Card key={trip.id} hoverable padding="none" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ position: 'relative', width: '100%', height: '160px' }}>
                <img
                  src={trip.image}
                  alt={trip.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{ position: 'absolute', top: '10px', left: '10px' }}>
                  <Badge variant={trip.status}>{trip.status}</Badge>
                </div>
              </div>

              <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text)' }}>
                  {trip.name}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--color-text-muted)' }}>
                  <Calendar size={14} />
                  <span>{trip.dates}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--color-text-muted)' }}>
                  <Compass size={14} />
                  <span>Stops: {trip.stops.join(' → ')}</span>
                </div>

                <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end' }}>
                  <Button variant="primary" size="sm">
                    View
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
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
          Previous Trips
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {previousTrips.map((trip) => (
            <Card key={trip.id} hoverable padding="none" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ position: 'relative', width: '100%', height: '160px' }}>
                <img
                  src={trip.image}
                  alt={trip.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{ position: 'absolute', top: '10px', left: '10px' }}>
                  <Badge variant={trip.status}>{trip.status}</Badge>
                </div>
              </div>

              <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text)' }}>
                  {trip.name}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--color-text-muted)' }}>
                  <Calendar size={14} />
                  <span>{trip.dates}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--color-text-muted)' }}>
                  <Compass size={14} />
                  <span>Stops: {trip.stops.join(' → ')}</span>
                </div>

                <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end' }}>
                  <Button variant="secondary" size="sm">
                    View
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ProfilePage;
