import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { jwtDecode } from 'jwt-decode';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleSocialLogin } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      handleSocialLogin(token);
      navigate('/'); // Redireciona para a home após o login
    } else {
      // Se não houver token, redireciona para o login com uma mensagem de erro
      navigate('/login', { state: { error: 'Falha na autenticação com Google.' } });
    }
  }, [searchParams, navigate, handleSocialLogin]);

  return <div>Processando autenticação...</div>;
};

export default AuthCallback;