import React, { createContext, useContext, useEffect, useState } from 'react';
import { authAPI } from '../lib/api';

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing admin session
    const adminSession = localStorage.getItem('admin_session');
    if (adminSession) {
      try {
        const session = JSON.parse(adminSession);
        setUser({
          id: session.id,
          username: session.username,
          email: session.email,
          fullName: session.fullName
        });
      } catch (error) {
        console.error('Error parsing admin session:', error);
        localStorage.removeItem('admin_session');
      }
    }
    setLoading(false);
  }, [])

  const signIn = async (username, password) => {
    try {
      const response = await authAPI.login(username, password);
      if (response.success) {
        const userData = {
          id: response.admin_id,
          username: response.username,
          email: response.email,
          fullName: response.full_name
        };
        setUser(userData);
        
        const adminSession = {
          ...userData,
          token: response.token,
          loginTime: new Date().toISOString()
        };
        localStorage.setItem('admin_session', JSON.stringify(adminSession));
        
        return { data: response, error: null };
      }
      return { data: null, error: { message: response.message || 'Login failed' } };
    } catch (error) {
      return { data: null, error: { message: error.response?.data?.detail || 'Network error. Please try again.' } };
    }
  }

  const signOut = async () => {
    try {
      localStorage.removeItem('admin_session');
      setUser(null);
      return { error: null };
    } catch (error) {
      return { error: { message: 'Error signing out' } };
    }
  }

  const value = {
    user,
    loading,
    signIn,
    signOut,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
