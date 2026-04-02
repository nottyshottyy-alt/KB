import axios from 'axios';

const api = axios.create({
    baseURL: '', // Relative paths for Next.js API routes
    withCredentials: true
});

export default api;
