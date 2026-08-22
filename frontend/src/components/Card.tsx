import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  border?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  hoverable = false,
  padding = 'md',
  border = true,
  className = '',
  style,
  ...props
}) => {
  const getPadding = () => {
    switch (padding) {
      case 'none':
        return '0';
      case 'sm':
        return '12px 16px';
      case 'lg':
        return '24px 28px';
      case 'md':
      default:
        return '20px 24px';
    }
  };

  const [isHovered, setIsHovered] = React.useState(false);

  const cardStyle: React.CSSProperties = {
    backgroundColor: 'var(--color-surface)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: isHovered && hoverable ? 'var(--shadow-hover)' : 'var(--shadow-card)',
    transform: isHovered && hoverable ? 'translateY(-3px)' : 'translateY(0)',
    transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
    border: border ? '1px solid var(--color-border)' : 'none',
    padding: getPadding(),
    overflow: 'hidden',
    ...style,
  };

  return (
    <div
      style={cardStyle}
      className={`gt-card ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
