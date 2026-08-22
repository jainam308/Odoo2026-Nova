import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from 'react';

export interface AuthUser {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_KEY = 'gt_token';
const USER_KEY = 'gt_user';

const DEMO_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTIsImVtYWlsIjoiZGVtb0BnbG9iZXRyb3R0ZXIuZGV2IiwiaWF0IjoxNzg3MzgxODAyfQ.AOC8y2nIPTarLM26hqdPk40-A1YwLk3NVAKjMGZJc_I';
const DEMO_USER: AuthUser = {
  id: 12,
  email: 'demo@globetrotter.dev',
  firstName: 'Demo',
  lastName: 'Traveler',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    localStorage.setItem(TOKEN_KEY, DEMO_TOKEN);
    return DEMO_TOKEN;
  });

  const [user, setUser] = useState<AuthUser | null>(() => {
    localStorage.setItem(USER_KEY, JSON.stringify(DEMO_USER));
    return DEMO_USER;
  });

  const login = (newToken: string, newUser: AuthUser) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
