import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; 
import { ThemeProviderWrapper } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext"; // Import it here

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProviderWrapper>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProviderWrapper>
  </React.StrictMode>
);
