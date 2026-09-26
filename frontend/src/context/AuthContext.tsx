import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, UserProfile, LoginPayload, SignupPayload } from '../api/services';
import { getToken, setToken, removeToken } from '../api/client';

export type UserRole = 'inventory_manager' | 'warehouse_staff';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  signup: (payload: SignupPayload) => Promise<void>;
  logout: () => void;
  switchRole: (targetRole?: UserRole) => Promise<void>;
  loginAsManager: () => Promise<void>;
  loginAsStaff: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setAuthToken] = useState<string | null>(getToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load user profile on startup if token exists
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = getToken();
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const profile = await authApi.getMe();
        setUser({
          id: profile.id,
          name: profile.name,
          email: profile.email,
          role: profile.role,
        });
        setAuthToken(storedToken);
      } catch (err) {
        console.warn('Stored token is invalid or backend unreachable:', err);
        // Clean up invalid session
        removeToken();
        setUser(null);
        setAuthToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (payload: LoginPayload) => {
    setIsLoading(true);
    try {
      const response = await authApi.login(payload);
      setToken(response.token);
      setAuthToken(response.token);
      setUser(response.user);
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (payload: SignupPayload) => {
    setIsLoading(true);
    try {
      const response = await authApi.signup(payload);
      setToken(response.token);
      setAuthToken(response.token);
      setUser({
        id: response.id,
        name: response.name,
        email: response.email,
        role: response.role,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    removeToken();
    setUser(null);
    setAuthToken(null);
  };

  // Quick switch between Manager and Staff roles using pre-seeded test credentials
  const switchRole = async (targetRole?: UserRole) => {
    const destination =
      targetRole ||
      (user?.role === 'inventory_manager' ? 'warehouse_staff' : 'inventory_manager');

    if (destination === 'inventory_manager') {
      await login({ email: 'admin@stocksense.com', password: 'Password123' });
    } else {
      await login({ email: 'staff@stocksense.com', password: 'Password123' });
    }
  };

  const loginAsManager = async () => {
    await login({ email: 'admin@stocksense.com', password: 'Password123' });
  };

  const loginAsStaff = async () => {
    await login({ email: 'staff@stocksense.com', password: 'Password123' });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        signup,
        logout,
        switchRole,
        loginAsManager,
        loginAsStaff,
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
