import React, { createContext, useState, useContext, useEffect } from 'react';
import { register as apiRegister, login as apiLogin, forgotPassword as apiForgotPassword } from '../services/api';
import toast from 'react-hot-toast';

export const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const register = async (userData) => {
    try {
      const response = await apiRegister(userData);
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      toast.success('Registration successful!');
      return { success: true, user };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const login = async (email, password, captchaId, captchaAnswer) => {
  try {
    const response = await apiLogin({ email, password, captchaId, captchaAnswer });
    const { token, user } = response.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
    toast.success('Login successful!');
    return { success: true, user };
  } catch (error) {
    const message = error.response?.data?.message || 'Login failed';
    toast.error(message);
    return { success: false, error: message };
  }
};

  const forgotPassword = async (email) => {
    try {
      const response = await apiForgotPassword({ email });
      toast.success(response.data.message);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send reset link';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      setUser,  // Add this line
      loading, 
      register, 
      login, 
      logout, 
      forgotPassword, 
      isAuthenticated: !!user 
    }}>
      {children}
    </AuthContext.Provider>
  );
};