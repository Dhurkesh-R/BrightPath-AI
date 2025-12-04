import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react'; // Or your framework plugin, e.g., 'vue'

// This configuration sets the development server to run on port 3000.
// If port 3000 is unavailable, Vite will automatically try the next available port.
export default defineConfig({
  plugins: [react()], // Replace 'react()' with your actual framework plugin if different
  
  // --- Port Configuration Block ---
  server: {
    // Specify the port number you want Vite to use
    port: 3000, 
    
    // Optional: If you want to automatically open the browser when the server starts
    // open: true, 
  }
  // --------------------------------
});