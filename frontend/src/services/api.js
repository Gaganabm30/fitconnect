import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api', // Adjustment needed for prod
});

// Add a request interceptor to add the auth token
api.interceptors.request.use(
    (config) => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.token) {
            config.headers.Authorization = `Bearer ${user.token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
