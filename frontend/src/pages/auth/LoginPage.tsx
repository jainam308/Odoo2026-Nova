import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Card, Input, Button } from '../../components';
import { User, Lock, Mail, AlertCircle } from 'lucide-react';

const GoogleIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
    />
  </svg>
);

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, googleLogin } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login({ email, password });
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setGoogleLoading(true);

    try {
      // Direct Google Login handshake
      await googleLogin({
        email: 'traveler.google@gmail.com',
        first_name: 'Alex',
        last_name: 'Google Traveler',
        photo_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      });
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Google authentication failed.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 68px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 16px',
        backgroundColor: 'var(--color-bg)',
      }}
    >
      <Card
        style={{
          width: '100%',
          maxWidth: '420px',
          padding: '36px 32px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        {/* Top Avatar Circle Icon matching PNG Screen 1 */}
        <div
          style={{
            width: '68px',
            height: '68px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-primary-light)',
            color: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
            border: '2px solid var(--color-primary)',
            boxShadow: '0 4px 12px rgba(15, 110, 110, 0.15)',
          }}
        >
          <User size={32} />
        </div>

        <h2
          style={{
            fontSize: '24px',
            fontWeight: 800,
            color: 'var(--color-primary)',
            marginBottom: '6px',
          }}
        >
          Welcome Back
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginBottom: '20px' }}>
          Sign in to your GlobeTrotter account
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
              marginBottom: '16px',
              textAlign: 'left',
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Google OAuth Login Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={googleLoading || loading}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            padding: '10px 16px',
            backgroundColor: '#ffffff',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            fontSize: '14px',
            fontWeight: 600,
            color: 'var(--color-text)',
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
            transition: 'all 0.2s ease',
            marginBottom: '18px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f8fafc';
            e.currentTarget.style.borderColor = '#cbd5e1';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#ffffff';
            e.currentTarget.style.borderColor = 'var(--color-border)';
          }}
        >
          <GoogleIcon />
          <span>{googleLoading ? 'Signing in with Google...' : 'Continue with Google'}</span>
        </button>

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
            OR
          </span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }} />
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            leftIcon={<Mail size={16} />}
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            leftIcon={<Lock size={16} />}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={loading}
            style={{ marginTop: '8px' }}
          >
            Log In
          </Button>
        </form>

        <div style={{ marginTop: '20px', fontSize: '13px', color: 'var(--color-text-muted)' }}>
          Don't have an account?{' '}
          <Link
            to="/register"
            style={{ color: 'var(--color-primary)', fontWeight: 700, textDecoration: 'underline' }}
          >
            Register Now
          </Link>
        </div>

        {/* Demo Credentials Helper */}
        <div
          style={{
            marginTop: '18px',
            padding: '10px',
            backgroundColor: 'var(--color-bg)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '12px',
            color: 'var(--color-text-muted)',
            width: '100%',
          }}
        >
          <strong>Demo credentials:</strong> demo@globetrotter.com / Password123!
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;
