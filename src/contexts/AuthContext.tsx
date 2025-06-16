import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState } from '../types';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (profileData: { name: string; photo?: string }) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
  });

  useEffect(() => {
    const savedAuth = localStorage.getItem('auth');
    if (savedAuth) {
      const parsedAuth = JSON.parse(savedAuth);
      setAuthState(parsedAuth);
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Demo login - in production, this would be a real API call
    if (email === 'diyetisyen@email.com' && password === '123456') {
      const user: User = {
        id: '1',
        email: 'diyetisyen@email.com',
        name: 'Dr. Ayşe Kaya',
        role: 'dietitian',
        photo: '',
      };
      
      const newAuthState = {
        isAuthenticated: true,
        user,
      };
      
      setAuthState(newAuthState);
      localStorage.setItem('auth', JSON.stringify(newAuthState));
      return true;
    }
    return false;
  };

  const logout = () => {
    setAuthState({
      isAuthenticated: false,
      user: null,
    });
    localStorage.removeItem('auth');
  };

  const updateProfile = (profileData: { name: string; photo?: string }) => {
    if (authState.user) {
      const updatedUser = {
        ...authState.user,
        name: profileData.name,
        photo: profileData.photo || authState.user.photo,
      };
      
      const newAuthState = {
        ...authState,
        user: updatedUser,
      };
      
      setAuthState(newAuthState);
      localStorage.setItem('auth', JSON.stringify(newAuthState));
    }
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};