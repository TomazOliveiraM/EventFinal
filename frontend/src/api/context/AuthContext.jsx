// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import jwtDecode from 'jwt-decode'; // Corrigido aqui
import apiClient from '../api/axiosConfig';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 > Date.now()) {
          setUser(decoded);
          setIsAuthenticated(true);
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
          localStorage.removeItem('token');
        }
      } catch (error) {
        console.error("Token inválido", error);
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await apiClient.post('/auth/login', { email, password });
    const { token } = response.data;

    localStorage.setItem('token', token);
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    const decodedUser = jwtDecode(token);
    setUser(decodedUser);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete apiClient.defaults.headers.common['Authorization'];
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = { user, isAuthenticated, loading, login, logout };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export default AuthContext;
