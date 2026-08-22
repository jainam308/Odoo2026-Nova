import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Globe, User, LogOut, Compass, MapPin, Calendar, Users, LogIn } from 'lucide-react';
import Button from './Button';

export interface NavbarUser {
  id?: number;
  first_name?: string;
  last_name?: string;
  email?: string;
  photo_url?: string;
}

export interface NavbarProps {
  user?: NavbarUser | null;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { label: 'Explore', path: '/', icon: <Compass size={16} /> },
    { label: 'Discover', path: '/discover', icon: <MapPin size={16} /> },
    { label: 'My Trips', path: '/trips', icon: <Globe size={16} /> },
    { label: 'Calendar', path: '/calendar', icon: <Calendar size={16} /> },
    { label: 'Community', path: '/community', icon: <Users size={16} /> },
  ];

  const getInitials = () => {
    if (!user) return 'G';
    const first = user.first_name ? user.first_name[0] : '';
    const last = user.last_name ? user.last_name[0] : '';
    return (first + last).toUpperCase() || user.email?.[0].toUpperCase() || 'U';
  };

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: '#ffffff',
        borderBottom: '1px solid var(--color-border)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 24px',
          height: '68px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '24px',
        }}
      >
        {/* Brand Logo */}
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            textDecoration: 'none',
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              backgroundColor: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 10px rgba(15, 110, 110, 0.25)',
            }}
          >
            <Globe size={22} />
          </div>
          <div>
            <span
              style={{
                fontSize: '20px',
                fontWeight: 800,
                color: 'var(--color-primary)',
                letterSpacing: '-0.02em',
              }}
            >
              Globe<span style={{ color: 'var(--color-accent)' }}>Trotter</span>
            </span>
          </div>
        </Link>

        {/* Center Nav Links */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '14px',
                fontWeight: 600,
                color: isActive(link.path) ? 'var(--color-primary)' : 'var(--color-text-muted)',
                backgroundColor: isActive(link.path) ? 'var(--color-primary-light)' : 'transparent',
                transition: 'all 0.2s ease',
              }}
            >
              {link.icon}
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>

        {/* Right User Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative' }}>
          {user ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '9999px',
                }}
              >
                {user.photo_url ? (
                  <img
                    src={user.photo_url}
                    alt="avatar"
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '2px solid var(--color-primary)',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-primary)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '15px',
                      boxShadow: '0 2px 6px rgba(15, 110, 110, 0.2)',
                    }}
                  >
                    {getInitials()}
                  </div>
                )}
              </button>

              {dropdownOpen && (
                <>
                  <div
                    onClick={() => setDropdownOpen(false)}
                    style={{ position: 'fixed', inset: 0, zIndex: 90 }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: '48px',
                      width: '220px',
                      backgroundColor: '#ffffff',
                      borderRadius: 'var(--radius-md)',
                      boxShadow: 'var(--shadow-modal)',
                      border: '1px solid var(--color-border)',
                      padding: '8px',
                      zIndex: 100,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                    }}
                  >
                    <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--color-border)' }}>
                      <p style={{ fontWeight: 700, fontSize: '14px', color: 'var(--color-text)' }}>
                        {user.first_name ? `${user.first_name} ${user.last_name || ''}` : 'Traveler'}
                      </p>
                      <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {user.email}
                      </p>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setDropdownOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 12px',
                        fontSize: '13px',
                        fontWeight: 500,
                        color: 'var(--color-text)',
                        borderRadius: 'var(--radius-sm)',
                        textDecoration: 'none',
                      }}
                    >
                      <User size={15} />
                      <span>Profile & Settings</span>
                    </Link>

                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        onLogout?.();
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 12px',
                        fontSize: '13px',
                        fontWeight: 500,
                        color: 'var(--color-danger)',
                        background: 'none',
                        border: 'none',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        width: '100%',
                      }}
                    >
                      <LogOut size={15} />
                      <span>Log Out</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/login')}
                leftIcon={<LogIn size={15} />}
              >
                Log In
              </Button>
              <Button
                variant="accent"
                size="sm"
                onClick={() => navigate('/register')}
              >
                Sign Up
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
