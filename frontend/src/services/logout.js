import axios from 'axios';

const api = axios.create({
    baseURL: 'https://brightpath-ai.onrender.com',
});

// Add a response interceptor
api.interceptors.response.use(
    (response) => response, // If the request is successful, just return the response
    (error) => {
        if (error.response && error.response.status === 401) {
            // 1. Clear local storage
            localStorage.clear();
            
            // 2. Force redirect to login
            // We use window.location because we are outside a React component/hook
            window.location.href = '/login';
            
            return Promise.reject(new Error("Session expired. Logging out..."));
        }
        return Promise.reject(error);
    }
);

// Inject the token into every request automatically
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
