// src/components/common/RoleBasedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../../../hooks/useAuth';

const RoleBasedRoute = ({ allowedRoles, children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Carregando...</div>; // ou um spinner

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return children;
};

export default RoleBasedRoute;
