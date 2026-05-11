import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export type UserRole = 'user' | 'admin' | 'master';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  empresa_id?: number;
  empresa_name?: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string, empresaId?: number) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string, empresaId: number) => Promise<void>;
}

import API_URL from '../api';
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) as User : null;
  });
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (email: string, password: string, empresaId?: number) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password, empresa_id: empresaId }),
      });

      if (!response.ok) throw new Error('Login failed');

      const data = await response.json();
      const mappedRole = data.role === 'super_admin' ? 'master' : data.role === 'admin' ? 'admin' : 'user';
      const userData: User = {
        id: String(data.id ?? '0'),
        username: data.username || email,
        email: data.email || email,
        role: mappedRole,
        empresa_id: data.empresa_id,
        empresa_name: data.empresa_name,
      };

      setToken(data.token);
      setUser(userData);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(userData));
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (email: string, password: string, empresaId: number) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password, empresa_id: empresaId }),
      });

      if (!response.ok) throw new Error('Registration failed');
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }, []);

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    loading,
    login,
    logout,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
