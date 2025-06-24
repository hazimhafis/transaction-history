import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthService } from '../services/authService';

interface AuthContextProps {
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextProps>({
  isAuthenticated: false,
});

interface AuthProviderProps {
  children: ReactNode;
  onLogout: () => void;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children, onLogout }) => {
  const authService = AuthService.getInstance();
  const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());

  useEffect(() => {
    const interval = setInterval(() => {
      const auth = authService.isAuthenticated();
      setIsAuthenticated(auth);
      if (!auth) {
        onLogout();
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [authService, onLogout]);

  return (
    <AuthContext.Provider value={{ isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 