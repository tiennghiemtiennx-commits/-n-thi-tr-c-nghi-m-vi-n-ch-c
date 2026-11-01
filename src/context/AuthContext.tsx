import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';
import { storageService, INITIAL_USERS } from '../services/storageService';

interface AuthContextType {
  currentUser: User;
  isAdmin: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  loginAsUser: (user: User) => void;
  register: (name: string, email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  switchRole: (role: Role) => void;
  updateProfile: (displayName: string, phone?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(() => storageService.getCurrentUser());

  useEffect(() => {
    storageService.init();
    setCurrentUser(storageService.getCurrentUser());
  }, []);

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const verified = storageService.verifyUserCredentials(email, pass);
      setCurrentUser(verified);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Đăng nhập không thành công.' };
    }
  };

  const loginAsUser = (user: User) => {
    storageService.setCurrentUser(user);
    setCurrentUser(user);
  };

  const register = async (name: string, email: string, pass: string): Promise<boolean> => {
    const newUser = storageService.registerUser(name, email, pass);
    setCurrentUser(newUser);
    return true;
  };

  const logout = () => {
    // Reset to student user or guest state
    const student = INITIAL_USERS[0];
    storageService.setCurrentUser(student);
    setCurrentUser(student);
  };

  const switchRole = (role: Role) => {
    const target = storageService.switchTestUser(role);
    setCurrentUser(target);
  };

  const updateProfile = (displayName: string, phone?: string) => {
    const updated = { ...currentUser, displayName, phone };
    storageService.setCurrentUser(updated);
    setCurrentUser(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAdmin: currentUser.role === 'admin',
        login,
        loginAsUser,
        register,
        logout,
        switchRole,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
