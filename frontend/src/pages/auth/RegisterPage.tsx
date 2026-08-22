import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Card, Input, Button, GoogleLoginButton } from '../../components';
import { UserPlus, Lock, Mail, User, Phone, MapPin, Globe, AlertCircle, FileText, Check, X } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    phone: '',
    city: '',
    country: '',
    bio: '',
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Live password validation checklist
  const passwordChecks = {
    length: formData.password.length >= 8,
    upper: /[A-Z]/.test(formData.password),
    lower: /[a-z]/.test(formData.password),
    number: /\d/.test(formData.password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password),
  };

  const isPasswordValid = Object.values(passwordChecks).every(Boolean);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Front-end sanity check
    const cleanPhone = formData.phone.replace(/[\s\-\(\)]/g, '');
    if (cleanPhone && cleanPhone.length < 10) {
      setError('Phone number must contain at least 10 digits.');
      return;
    }

    if (!isPasswordValid) {
      setError('Password does not meet the security requirements.');
      return;
    }

    setLoading(true);
    try {
      await signup(formData);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 68px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 16px',
        backgroundColor: 'var(--color-bg)',
      }}
    >
      <Card
        style={{
          width: '100%',
          maxWidth: '680px',
          padding: '36px 36px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Top Avatar/Icon Circle matching PNG Screen 2 */}
        <div
          style={{
            width: '68px',
            height: '68px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-accent-light)',
            color: 'var(--color-accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
            border: '2px solid var(--color-accent)',
            boxShadow: '0 4px 12px rgba(255, 122, 89, 0.2)',
          }}
        >
          <UserPlus size={30} />
        </div>

        <h2
          style={{
            fontSize: '26px',
            fontWeight: 800,
            color: 'var(--color-primary)',
            marginBottom: '6px',
            textAlign: 'center',
          }}
        >
          Create an Account
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginBottom: '20px', textAlign: 'center' }}>
          Join GlobeTrotter to craft, explore, and share seamless itineraries
        </p>

        {error && (
          <div
            style={{
              width: '100%',
              padding: '10px 14px',
              backgroundColor: '#FEF2F2',
              border: '1px solid #FECACA',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--color-danger)',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '18px',
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Google OAuth Quick Sign-Up using shared GoogleLoginButton */}
        <GoogleLoginButton
          text="signup_with"
          onSuccess={() => navigate('/')}
          onError={(msg) => setError(msg)}
        />

        {/* Divider */}
        <div
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            margin: '0 0 18px',
          }}
        >
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }} />
          <span style={{ padding: '0 12px', fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 600 }}>
            OR FILL IN DETAILS
          </span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }} />
        </div>

        {/* Registration Form (Two-Column Layout matching PNG Screen 2) */}
        <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            <Input
              label="First Name"
              name="first_name"
              placeholder="e.g. John"
              value={formData.first_name}
              onChange={handleChange}
              required
              leftIcon={<User size={16} />}
            />

            <Input
              label="Last Name"
              name="last_name"
              placeholder="e.g. Doe"
              value={formData.last_name}
              onChange={handleChange}
              leftIcon={<User size={16} />}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            <Input
              label="Email Address"
              name="email"
              type="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              leftIcon={<Mail size={16} />}
            />

            <Input
              label="Phone Number"
              name="phone"
              type="tel"
              placeholder="e.g. +14155552671 (min 10 digits)"
              value={formData.phone}
              onChange={handleChange}
              helperText="Must contain at least 10 digits"
              leftIcon={<Phone size={16} />}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            <Input
              label="City"
              name="city"
              placeholder="e.g. San Francisco"
              value={formData.city}
              onChange={handleChange}
              leftIcon={<MapPin size={16} />}
            />

            <Input
              label="Country"
              name="country"
              placeholder="e.g. United States"
              value={formData.country}
              onChange={handleChange}
              leftIcon={<Globe size={16} />}
            />
          </div>

          <div>
            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="Min. 8 chars with uppercase, number & symbol"
              value={formData.password}
              onChange={handleChange}
              required
              leftIcon={<Lock size={16} />}
            />

            {/* Live Password Security Checklist */}
            {formData.password.length > 0 && (
              <div
                style={{
                  marginTop: '8px',
                  padding: '10px 14px',
                  backgroundColor: '#F8FAFC',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '6px',
                  fontSize: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: passwordChecks.length ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
                  {passwordChecks.length ? <Check size={14} /> : <X size={14} />} 8+ Characters
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: passwordChecks.upper ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
                  {passwordChecks.upper ? <Check size={14} /> : <X size={14} />} Uppercase (A-Z)
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: passwordChecks.lower ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
                  {passwordChecks.lower ? <Check size={14} /> : <X size={14} />} Lowercase (a-z)
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: passwordChecks.number ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
                  {passwordChecks.number ? <Check size={14} /> : <X size={14} />} Number (0-9)
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: passwordChecks.special ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
                  {passwordChecks.special ? <Check size={14} /> : <X size={14} />} Symbol (@$!%*?)
                </div>
              </div>
            )}
          </div>

          {/* Additional Information / Bio matching PNG Screen 2 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
            <label style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text)' }}>
              Additional Information / Travel Interests
            </label>
            <div
              style={{
                position: 'relative',
                display: 'flex',
                backgroundColor: '#ffffff',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                padding: '10px 14px',
              }}
            >
              <div style={{ marginRight: '8px', color: 'var(--color-text-muted)' }}>
                <FileText size={16} />
              </div>
              <textarea
                name="bio"
                placeholder="Tell us about your favorite travel styles, dream destinations, or dietary preferences..."
                value={formData.bio}
                onChange={handleChange}
                rows={3}
                style={{
                  width: '100%',
                  border: 'none',
                  outline: 'none',
                  fontSize: '14px',
                  color: 'var(--color-text)',
                  backgroundColor: 'transparent',
                  resize: 'vertical',
                }}
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="accent"
            size="lg"
            fullWidth
            isLoading={loading}
            style={{ marginTop: '10px' }}
          >
            Register Now
          </Button>
        </form>

        <div style={{ marginTop: '20px', fontSize: '13px', color: 'var(--color-text-muted)' }}>
          Already have an account?{' '}
          <Link
            to="/login"
            style={{ color: 'var(--color-primary)', fontWeight: 700, textDecoration: 'underline' }}
          >
            Log In
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default RegisterPage;
