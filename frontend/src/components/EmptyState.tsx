import React from 'react';
import { Compass } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No items found',
  description = 'Try adjusting your search filters or add a new item.',
  actionText,
  onAction,
  icon,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '48px 24px',
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px dashed var(--color-border)',
        margin: '24px 0',
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: 'var(--color-primary-light)',
          color: 'var(--color-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px',
        }}
      >
        {icon || <Compass size={28} />}
      </div>

      <h3
        style={{
          fontSize: '18px',
          fontWeight: 700,
          color: 'var(--color-text)',
          marginBottom: '8px',
        }}
      >
        {title}
      </h3>

      <p
        style={{
          fontSize: '14px',
          color: 'var(--color-text-muted)',
          maxWidth: '400px',
          marginBottom: actionText ? '20px' : '0',
          lineHeight: 1.5,
        }}
      >
        {description}
      </p>

      {actionText && onAction && (
        <Button variant="primary" size="md" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
