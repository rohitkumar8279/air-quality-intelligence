import React, { createContext, useState, useEffect } from 'react';
import { login, register, getCurrentUser } from '../services/authApi';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const userData = await getCurrentUser();
          setUser(userData);
        } catch (error) {
          console.error("Token invalid or expired", error);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const loginUser = async (email, password) => {
    const data = await login(email, password);
    localStorage.setItem('token', data.access_token);
    const userData = await getCurrentUser();
    setUser(userData);
  };

  const registerUser = async (userData) => {
    await register(userData);
    await loginUser(userData.email, userData.password);
  };

  const logoutUser = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginUser, registerUser, logoutUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
