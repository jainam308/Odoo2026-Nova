import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  style,
  ...props
}) => {
  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: 'var(--color-primary)',
          color: '#ffffff',
          border: '1px solid var(--color-primary)',
        };
      case 'accent':
        return {
          backgroundColor: 'var(--color-accent)',
          color: '#ffffff',
          border: '1px solid var(--color-accent)',
        };
      case 'secondary':
        return {
          backgroundColor: '#ffffff',
          color: 'var(--color-primary)',
          border: '1.5px solid var(--color-primary)',
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          color: 'var(--color-text)',
          border: '1px solid transparent',
        };
      case 'danger':
        return {
          backgroundColor: 'var(--color-danger)',
          color: '#ffffff',
          border: '1px solid var(--color-danger)',
        };
      default:
        return {};
    }
  };

  const getSizeStyles = (): React.CSSProperties => {
    switch (size) {
      case 'sm':
        return {
          padding: '6px 14px',
          fontSize: '13px',
          borderRadius: 'var(--radius-sm)',
        };
      case 'lg':
        return {
          padding: '14px 28px',
          fontSize: '16px',
          borderRadius: 'var(--radius-md)',
        };
      case 'md':
      default:
        return {
          padding: '10px 20px',
          fontSize: '14px',
          borderRadius: 'var(--radius-md)',
        };
    }
  };

  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontWeight: 600,
    cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
    opacity: disabled || isLoading ? 0.65 : 1,
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    width: fullWidth ? '100%' : 'auto',
    outline: 'none',
    boxShadow: variant === 'accent' ? '0 4px 12px rgba(255, 122, 89, 0.25)' : 'none',
    ...getVariantStyles(),
    ...getSizeStyles(),
    ...style,
  };

  return (
    <button
      disabled={disabled || isLoading}
      style={baseStyle}
      className={`gt-button ${className}`}
      {...props}
    >
      {isLoading ? (
        <span style={{
          width: '16px',
          height: '16px',
          border: '2px solid rgba(255, 255, 255, 0.3)',
          borderTopColor: '#ffffff',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          display: 'inline-block'
        }} />
      ) : (
        leftIcon
      )}
      <span>{children}</span>
      {!isLoading && rightIcon}
    </button>
  );
};

export default Button;
