import React from 'react';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullPage?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  text = 'Loading...',
  fullPage = false,
}) => {
  const getSpinnerDimensions = () => {
    switch (size) {
      case 'sm':
        return '20px';
      case 'lg':
        return '48px';
      case 'md':
      default:
        return '32px';
    }
  };

  const dim = getSpinnerDimensions();

  const content = (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '32px' }}>
      <div
        style={{
          width: dim,
          height: dim,
          border: '3px solid rgba(15, 110, 110, 0.15)',
          borderTopColor: 'var(--color-primary)',
          borderRadius: '50%',
          animation: 'gtSpin 0.75s cubic-bezier(0.68, -0.55, 0.27, 1.55) infinite',
        }}
      />
      {text && (
        <span style={{ fontSize: '14px', color: 'var(--color-text-muted)', fontWeight: 500 }}>
          {text}
        </span>
      )}
      <style>{`
        @keyframes gtSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );

  if (fullPage) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {content}
      </div>
    );
  }

  return content;
};

export default LoadingSpinner;
