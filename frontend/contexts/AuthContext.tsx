// frontend/contexts/AuthContext.tsx
"use client";

import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { apiClient, login as apiLogin, getCurrentUser, LoginData } from '@/lib/api';
import { User } from '@/lib/types';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  login: (data: LoginData) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('authToken');
      if (storedToken) {
        setToken(storedToken);
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        try {
          const userData = await getCurrentUser();
          setUser(userData);
        } catch (error) {
          console.error("Session expired or token invalid", error);
          localStorage.removeItem('authToken');
          setToken(null);
          setUser(null);
          delete apiClient.defaults.headers.common['Authorization'];
          router.push('/login');
        }
      }
      setIsLoading(false);
    };
    initializeAuth();
  }, [router]);

  const login = async (data: LoginData) => {
    const { access_token } = await apiLogin(data);
    localStorage.setItem('authToken', access_token);
    setToken(access_token);
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
    const userData = await getCurrentUser();
    setUser(userData);
    router.push('/');
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setToken(null);
    setUser(null);
    delete apiClient.defaults.headers.common['Authorization'];
    router.push('/login');
  };

  const value = {
    isAuthenticated: !!token && !!user,
    user,
    token,
    login,
    logout,
    isLoading,
  };

  // Do not render protected layout if loading or on login page
  if (isLoading) {
    return <div>ロード中</div>;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}