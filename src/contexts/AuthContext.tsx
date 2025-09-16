import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  username: string;
  email?: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (username: string, password: string) => Promise<boolean>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for saved user in localStorage
    const savedUser = localStorage.getItem('travel-saviours-user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    // Mock authentication - in real app, this would call your API
    if (username && password) {
      const mockUser: User = {
        id: Date.now().toString(),
        username,
        email: `${username}@example.com`,
      };
      setUser(mockUser);
      localStorage.setItem('travel-saviours-user', JSON.stringify(mockUser));
      return true;
    }
    return false;
  };

  const register = async (username: string, password: string): Promise<boolean> => {
    // Mock registration - in real app, this would call your API
    if (username && password) {
      const mockUser: User = {
        id: Date.now().toString(),
        username,
        email: `${username}@example.com`,
      };
      setUser(mockUser);
      localStorage.setItem('travel-saviours-user', JSON.stringify(mockUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('travel-saviours-user');
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        login, 
        logout, 
        register, 
        isAuthenticated: !!user 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};