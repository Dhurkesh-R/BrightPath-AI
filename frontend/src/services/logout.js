import axios from 'axios';

const api = axios.create({
  baseURL: 'https://brightpath-ai.onrender.com',
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 1. Check if the error is specifically a 401 Unauthorized
    if (error.response && error.response.status === 401) {
      // Check if it's truly an expiration (and not just a missing token)
      console.warn("Session expired. Logging out...");
      
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      
      // Redirect to login
      window.location.href = "/login";
    }

    // 2. Handle Server Spin-up (502, 503, 504 or Network Error)
    // If the error is a 502/503/504, we DON'T logout. 
    // We let the 'isAwake' logic in App.js handle the loader.
    return Promise.reject(error);
  }
);

export default api;
