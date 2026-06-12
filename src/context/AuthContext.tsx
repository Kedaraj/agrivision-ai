import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../lib/api';
import { getToken, setToken, clearToken, setStoredUser, getStoredUser, AuthUser } from '../lib/auth';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: { name: string; email: string; phone: string; password: string }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(getStoredUser());
  const [isLoading, setIsLoading] = useState(false);

  const refreshUser = async () => {
    try {
      const profile = await api.get<AuthUser>('/api/auth/profile');
      setUser(profile); setStoredUser(profile);
    } catch { logout(); }
  };

  useEffect(() => { if (getToken() && !user) refreshUser(); }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post<{ token: string; user: AuthUser }>('/api/auth/login', { email, password });
    setToken(res.token); setUser(res.user); setStoredUser(res.user);
  };

  const signup = async (data: { name: string; email: string; phone: string; password: string }) => {
    const res = await api.post<{ token: string; user: AuthUser }>('/api/auth/signup', data);
    setToken(res.token); setUser(res.user); setStoredUser(res.user);
  };

  const logout = () => { clearToken(); setUser(null); };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
