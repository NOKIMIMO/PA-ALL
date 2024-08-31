import React, { createContext, useContext, useState, useEffect } from 'react';
import UserService from '../services/UserService';
import { CustomError } from '../commons/Error';

type User = {
  id: number;
  email: string;
  role: string;
  active: boolean;
};

type UserContextType = {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  fetchUserData: () => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async () => {
    try {
      if (localStorage.getItem('token')) {
        const data = await UserService.getUserDataByToken();
        if (data instanceof CustomError) {
          localStorage.removeItem('token');
          setUser(null);
        } else {
          setUser(data);
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      localStorage.removeItem('token');
      setUser(null);
    }finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, setUser, fetchUserData }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
