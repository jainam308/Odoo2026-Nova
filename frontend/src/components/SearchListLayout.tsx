import type { ReactNode } from 'react';

// Shared layout for list/search screens: search bar + filter row, then content.
export default function SearchListLayout({
  search,
  filters,
  children,
  title,
}: {
  title?: string;
  search?: ReactNode;
  filters?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      {title && <h1 className="mb-4 text-2xl font-bold text-primary">{title}</h1>}
      {(search || filters) && (
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          {search && <div className="flex-1">{search}</div>}
          {filters}
        </div>
      )}
      {children}
    </div>
  );
}
