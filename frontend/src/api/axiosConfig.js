// src/api/axiosConfig.js
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api', // ajuste conforme sua API
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;
