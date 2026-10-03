import axios from 'axios';

const API = axios.create({
  baseURL: 'https://hactoberfest-backend.vercel.app/api',
});

// Attach JWT token to headers if available
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;