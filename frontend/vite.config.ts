import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {},
  
  // Performance optimizations
  build: {
    // Target modern browsers for better optimizations
    target: 'es2020',
    
    // Optimize chunk size
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          // Vendor chunks for better caching
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['framer-motion', 'clsx', '@tailwindcss/vite'],
          'vendor-charts': ['echarts', 'echarts-for-react'],
          'vendor-monaco': ['monaco-editor', '@monaco-editor/react'],
          'vendor-icons': ['react-icons', 'lucide-react'],
          'vendor-utils': ['axios', 'jwt-decode'],
          
          // Context and state management
          'context': ['react-redux'],
        }
      }
    },
    
    // Optimize minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console logs in production
        drop_debugger: true,
        pure_funcs: ['console.log'], // Remove specific console functions
      },
    },
    
    // Optimize chunk size warnings
    chunkSizeWarningLimit: 1000,
    
    // Enable sourcemap for debugging (disable in production if needed)
    sourcemap: false,
  },
  
  // Dependency optimization
  optimizeDeps: {
    include: [
      // Pre-bundle frequently used dependencies
      'react',
      'react-dom',
      'react-router-dom',
      'clsx',
      'framer-motion'
    ],
    exclude: [
      // Don't pre-bundle heavy dependencies (lazy load instead)
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
  }
});
