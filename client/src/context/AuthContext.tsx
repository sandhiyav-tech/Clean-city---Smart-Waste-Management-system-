import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import axiosClient from '../api/axiosClient';
import { User, Role } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<User>;
  signup: (userData: { name: string; email: string; password: string; role?: Role; phone?: string }) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('cleancity_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = useCallback(async () => {
    try {
      const res = await axiosClient.get('/auth/me');
      if (res.data?.success && res.data.data?.user) {
        setUser(res.data.data.user);
        localStorage.setItem('cleancity_user', JSON.stringify(res.data.data.user));
      } else {
        localStorage.removeItem('cleancity_token');
        localStorage.removeItem('cleancity_user');
        setUser(null);
      }
    } catch {
      // If network/offline or token expired, keep cached user temporarily or clear if 401
      const token = localStorage.getItem('cleancity_token');
      if (!token) {
        setUser(null);
        localStorage.removeItem('cleancity_user');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (credentials: { email: string; password: string }): Promise<User> => {
    const res = await axiosClient.post('/auth/login', credentials);
    const loggedUser = res.data.data.user;
    const token = res.data.data.token;
    if (token) {
      localStorage.setItem('cleancity_token', token);
      localStorage.setItem('cleancity_user', JSON.stringify(loggedUser));
    }
    setUser(loggedUser);
    return loggedUser;
  };

  const signup = async (userData: {
    name: string;
    email: string;
    password: string;
    role?: Role;
    phone?: string;
  }): Promise<User> => {
    const res = await axiosClient.post('/auth/signup', userData);
    const newUser = res.data.data.user;
    const token = res.data.data.token;
    if (token) {
      localStorage.setItem('cleancity_token', token);
      localStorage.setItem('cleancity_user', JSON.stringify(newUser));
    }
    setUser(newUser);
    return newUser;
  };

  const logout = async () => {
    try {
      await axiosClient.post('/auth/logout');
    } catch (e) {
      console.warn('Logout failed on server:', e);
    } finally {
      localStorage.removeItem('cleancity_token');
      localStorage.removeItem('cleancity_user');
      setUser(null);
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        refreshUser,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

