import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Preload critical resources
    preTransformRequests: true,
    // Fix sourcemap issues
    sourcemapIgnoreList: (sourcePath) => {
      return sourcePath.includes('node_modules/monaco-editor')
    }
  },
  
  // Performance optimizations for SPA feeling
  build: {
    // Target modern browsers for better optimizations
    target: 'es2020',
    
    // Optimize chunk size - Less aggressive splitting for SPA feeling
    rollupOptions: {
      output: {
        // Strategic chunk splitting for optimal caching and SPA performance
        manualChunks: {
          // Core app bundle - Keep pages together for instant navigation
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          
          // Heavy libraries - Only split these for lazy loading
          'vendor-charts': ['echarts', 'echarts-for-react'],
          'vendor-monaco': ['monaco-editor', '@monaco-editor/react'],
          
          // UI libraries - Keep together for consistent UX
          'vendor-ui': ['framer-motion', 'clsx', 'lucide-react', 'react-icons'],
          'vendor-utils': ['axios', 'jwt-decode', 'sonner'],
        }
      }
    },
    
    // Optimize minification
    minify: 'esbuild',
    
    // Optimize chunk size warnings - Allow larger chunks for SPA feeling
    chunkSizeWarningLimit: 2000,
    
    // Enable sourcemap for debugging (disable in production if needed)
    sourcemap: false,
  },
  
  // Dependency optimization for faster development and SPA performance
  optimizeDeps: {
    include: [
      // Pre-bundle frequently used dependencies for faster startup
      'react',
      'react-dom',
      'react-router-dom',
      'clsx',
      'framer-motion',
      'axios',
      'jwt-decode'
    ],
    exclude: [
      // Only exclude truly heavy dependencies that benefit from lazy loading
      'monaco-editor',
      'echarts',
      'pyodide'
    ]
  },
  
  // Performance settings
  esbuild: {
    // Tree shaking optimizations
    treeShaking: true,
    // Remove unused code more aggressively
    drop: ['console', 'debugger'],
  },
  
  // CSS optimizations
  css: {
    devSourcemap: false,
    // Optimize CSS for better loading
    preprocessorOptions: {
      // Add any CSS optimizations here
    }
  }
});
