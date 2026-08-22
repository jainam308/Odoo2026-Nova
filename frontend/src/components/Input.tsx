import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export default function Input({ label, id, className = '', ...rest }: InputProps) {
  return (
    <label className="flex flex-col gap-1 text-sm font-bold text-primary">
      {label && <span>{label}</span>}
      <input
        id={id}
        className={`rounded-xl border-2 border-primary/30 bg-surface px-3.5 py-2 text-sm font-semibold text-primary placeholder:text-primary/50 shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 ${className}`}
        {...rest}
      />
    </label>
  );
}
