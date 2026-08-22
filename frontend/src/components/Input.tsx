import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  className = '',
  id,
  style,
  ...props
}, ref) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  const [isFocused, setIsFocused] = React.useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            fontSize: '14px',
            fontWeight: 600,
            color: 'var(--color-text)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>{label}</span>
          {props.required && <span style={{ color: 'var(--color-accent)', fontSize: '12px' }}>*</span>}
        </label>
      )}

      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-sm)',
          border: error
            ? '1.5px solid var(--color-danger)'
            : isFocused
            ? '1.5px solid var(--color-primary)'
            : '1px solid var(--color-border)',
          boxShadow: isFocused ? '0 0 0 3px var(--color-primary-light)' : 'none',
          transition: 'all 0.2s ease',
        }}
      >
        {leftIcon && (
          <div style={{ paddingLeft: '12px', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center' }}>
            {leftIcon}
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          style={{
            width: '100%',
            padding: leftIcon ? '10px 12px 10px 8px' : '10px 14px',
            fontSize: '14px',
            color: 'var(--color-text)',
            backgroundColor: 'transparent',
            border: 'none',
            outline: 'none',
            borderRadius: 'var(--radius-sm)',
            ...style,
          }}
          className={`gt-input ${className}`}
          {...props}
        />

        {rightIcon && (
          <div style={{ paddingRight: '12px', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center' }}>
            {rightIcon}
          </div>
        )}
      </div>

      {error ? (
        <span style={{ fontSize: '12px', color: 'var(--color-danger)', fontWeight: 500 }}>
          {error}
        </span>
      ) : helperText ? (
        <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
          {helperText}
        </span>
      ) : null}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
