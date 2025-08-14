import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  accessToken: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
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
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth token on app load
    const checkAuth = async () => {
      try {
        const authData = localStorage.getItem('banking_auth_token');
        if (authData) {
          // Parse the stored user data directly
          const userData = JSON.parse(authData);
          setUser(userData);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('banking_auth_token');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Mock OAuth 2.0 authentication
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (email === 'demo@bank.com' && password === 'demo1235') {
        const userData: User = {
          id: '1',
          name: 'John Doe',
          email: 'demo@bank.com',
          accessToken: 'mock-access-token-' + Date.now()
        };
        
        // Store user data as JSON string
        localStorage.setItem('banking_auth_token', JSON.stringify(userData));
        
        setUser(userData);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('banking_auth_token');
    // Clear any cached user data
    setUser(null);
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isAuthenticated: !!user,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
};