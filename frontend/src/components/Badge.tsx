import React from 'react';

export type BadgeCategory = 'sightseeing' | 'food' | 'adventure' | 'nightlife' | 'culture' | 'ongoing' | 'upcoming' | 'completed' | 'custom' | string;

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeCategory;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'custom',
  size = 'md',
  className = '',
  style,
  ...props
}) => {
  const getBadgeColors = (): { bg: string; text: string; border: string } => {
    switch (variant.toLowerCase()) {
      case 'sightseeing':
        return { bg: '#E0F2FE', text: '#0369A1', border: '#BAE6FD' };
      case 'food':
        return { bg: '#FEF3C7', text: '#B45309', border: '#FDE68A' };
      case 'adventure':
        return { bg: '#DCFCE7', text: '#15803D', border: '#BBF7D0' };
      case 'nightlife':
        return { bg: '#F3E8FF', text: '#7E22CE', border: '#E9D5FF' };
      case 'culture':
        return { bg: '#FFE4E6', text: '#BE123C', border: '#FECDD3' };
      case 'ongoing':
        return { bg: '#E6F4F4', text: '#0F6E6E', border: '#B8E2E2' };
      case 'upcoming':
        return { bg: '#FFF7ED', text: '#C2410C', border: '#FFEDD5' };
      case 'completed':
        return { bg: '#F3F4F6', text: '#4B5563', border: '#E5E7EB' };
      default:
        return { bg: '#F3F4F6', text: '#374151', border: '#E5E7EB' };
    }
  };

  const colors = getBadgeColors();

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: size === 'sm' ? '2px 8px' : '4px 12px',
        fontSize: size === 'sm' ? '11px' : '12px',
        fontWeight: 600,
        borderRadius: '9999px',
        backgroundColor: colors.bg,
        color: colors.text,
        border: `1px solid ${colors.border}`,
        textTransform: 'capitalize',
        letterSpacing: '0.02em',
        lineHeight: 1.4,
        ...style,
      }}
      className={`gt-badge ${className}`}
      {...props}
    >
      {children || variant}
    </span>
  );
};

export default Badge;
