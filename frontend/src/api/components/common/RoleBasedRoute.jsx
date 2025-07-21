import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import PrivateRoute from './PrivateRoute';

const RoleBasedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  // Primeiro, garante que o usuário está autenticado
  // Depois, verifica se a permissão dele está na lista de permissões permitidas
  const isAuthorized = user && allowedRoles.includes(user.role);

  if (!isAuthorized) {
    // Pode redirecionar para uma página "Não Autorizado" ou para a home
    return <Navigate to="/" replace />;
  }

  return children;
};

export default RoleBasedRoute;

