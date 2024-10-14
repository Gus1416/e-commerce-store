import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  // Plugins are functions that are called during the compilation process
  // They can be used to add new features to the build process
  // The react plugin is used to enable React features like JSX
  plugins: [react()],

  // The server option is used to configure the development server
  // The proxy option is used to forward requests to a backend server
  // In this case, requests to /api are forwarded to http://localhost:5000
  // This is useful for developing an app that makes requests to a backend API
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000",
      },
    },
  },
})
