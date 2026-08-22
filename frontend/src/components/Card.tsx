import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function Card({ children, className = '', onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`rounded-lg bg-surface p-5 shadow-card border border-border ${className}`}
    >
      {children}
    </div>
  );
}
