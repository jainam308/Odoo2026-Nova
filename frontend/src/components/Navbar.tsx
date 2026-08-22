import { UserCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-surface/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-xl font-extrabold text-primary">Globe</span>
          <span className="text-xl font-extrabold text-accent">Trotter</span>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="hidden text-xs font-semibold text-primary sm:inline bg-primary/10 px-3 py-1 rounded-full">
                {user.firstName ?? user.email}
              </span>
              <button
                onClick={logout}
                className="rounded-xl bg-danger/10 border border-danger/20 px-3.5 py-1.5 text-xs font-bold text-danger hover:bg-danger/20 transition-all"
              >
                Logout
              </button>
            </>
          ) : (
            <UserCircle2 className="h-8 w-8 text-primary" />
          )}
        </div>
      </div>
    </header>
  );
}
