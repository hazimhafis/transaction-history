import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthService } from '../services/authService';

interface AuthContextProps {
  isAuthenticated: boolean;
  authenticatedTransactions: Set<string>;
  authenticateForTransaction: (transactionId: string) => Promise<boolean>;
  isTransactionAuthenticated: (transactionId: string) => boolean;
  clearTransactionAuth: () => void;
}

const AuthContext = createContext<AuthContextProps>({
  isAuthenticated: false,
  authenticatedTransactions: new Set(),
  authenticateForTransaction: async () => false,
  isTransactionAuthenticated: () => false,
  clearTransactionAuth: () => {},
});

interface AuthProviderProps {
  children: ReactNode;
  onLogout: () => void;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children, onLogout }) => {
  const authService = AuthService.getInstance();
  const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());
  const [authenticatedTransactions, setAuthenticatedTransactions] = useState<Set<string>>(new Set());

  const authenticateForTransaction = async (transactionId: string): Promise<boolean> => {
    try {
      const success = await authService.authenticateWithBiometrics();
      if (success) {
        setAuthenticatedTransactions(prev => new Set([...prev, transactionId]));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Transaction authentication failed:', error);
      return false;
    }
  };

  const isTransactionAuthenticated = (transactionId: string): boolean => {
    return authenticatedTransactions.has(transactionId);
  };

  const clearTransactionAuth = () => {
    setAuthenticatedTransactions(new Set());
  };

  useEffect(() => {
    const interval = setInterval(() => {
      // Check main authentication (this already handles expiration)
      const auth = authService.isAuthenticated();
      setIsAuthenticated(auth);
      if (!auth) {
        clearTransactionAuth(); // Clear transaction auth if main auth fails
        onLogout();
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [authService, onLogout]);

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      authenticatedTransactions,
      authenticateForTransaction,
      isTransactionAuthenticated,
      clearTransactionAuth
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 