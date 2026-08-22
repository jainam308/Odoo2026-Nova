import React from 'react';
import { Search } from 'lucide-react';
import Input from './Input';

export interface FilterOption {
  id: string;
  label: string;
}

export interface SearchListLayoutProps {
  title: string;
  subtitle?: string;
  searchValue: string;
  onSearchChange: (val: string) => void;
  searchPlaceholder?: string;
  filterOptions?: FilterOption[];
  activeFilter?: string;
  onFilterChange?: (filterId: string) => void;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export const SearchListLayout: React.FC<SearchListLayoutProps> = ({
  title,
  subtitle,
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search destinations, places, activities...',
  filterOptions = [],
  activeFilter = 'all',
  onFilterChange,
  actions,
  children,
}) => {
  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px', width: '100%' }}>
      {/* Header Row */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '28px',
              fontWeight: 800,
              color: 'var(--color-primary)',
              letterSpacing: '-0.02em',
              marginBottom: '4px',
            }}
          >
            {title}
          </h1>
          {subtitle && (
            <p style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>
              {subtitle}
            </p>
          )}
        </div>

        {actions && <div>{actions}</div>}
      </div>

      {/* Search & Filter Row */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          backgroundColor: '#ffffff',
          padding: '16px 20px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-card)',
          marginBottom: '28px',
        }}
      >
        <div style={{ width: '100%' }}>
          <Input
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            leftIcon={<Search size={18} />}
          />
        </div>

        {filterOptions.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-muted)', marginRight: '4px' }}>
              Filter:
            </span>
            {filterOptions.map((opt) => {
              const isSelected = activeFilter === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => onFilterChange?.(opt.id)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '9999px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    border: isSelected
                      ? '1px solid var(--color-primary)'
                      : '1px solid var(--color-border)',
                    backgroundColor: isSelected
                      ? 'var(--color-primary)'
                      : 'var(--color-bg)',
                    color: isSelected ? '#ffffff' : 'var(--color-text)',
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Grid or List Content */}
      <div>{children}</div>
    </div>
  );
};

export default SearchListLayout;
