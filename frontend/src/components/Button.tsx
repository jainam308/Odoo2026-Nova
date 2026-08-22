import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'accent' | 'ghost' | 'danger';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
}

const base =
  'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed';

const variants: Record<Variant, string> = {
  primary: 'bg-primary text-white shadow-md hover:bg-primary-dark active:scale-[0.98]',
  secondary: 'border border-border bg-surface text-primary hover:bg-primary/5 active:scale-[0.98]',
  accent: 'bg-accent text-white shadow-md hover:bg-accent-dark active:scale-[0.98]',
  ghost: 'text-primary hover:bg-primary/10 active:scale-[0.98]',
  danger: 'bg-danger text-white shadow-md hover:bg-danger/90 active:scale-[0.98]',
};

export default function Button({
  variant = 'primary',
  className = '',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...rest}>
      {children}
    </button>
  );
}
