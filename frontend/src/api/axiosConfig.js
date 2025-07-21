import axios from 'axios';

const apiClient = axios.create({
  // IMPORTANTE: Aponte para a URL do seu backend Node.js
  baseURL: 'http://localhost:3003/api', // Use a URL do seu deploy (Render, etc.) em produção
});

// Interceptor para adicionar o token JWT em todas as requisições
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;