import dotenv from 'dotenv';
import path from 'path';
dotenv.config();

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Enable Fast Refresh for better development experience
      fastRefresh: true,
      // Include .jsx files in Fast Refresh
      include: "**/*.{jsx,tsx}",
    })
  ],
  
  // Path aliases for cleaner imports
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@api': path.resolve(__dirname, './src/api'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@context': path.resolve(__dirname, './src/context'),
      '@assets': path.resolve(__dirname, './src/assets'),
    }
  },

  // Development server configuration
  server: {
    port: 8080,
    host:'0.0.0.0', // Allow external connections
    strictPort: true, // Exit if port is already in use
    proxy: {
      '/api': {
        target: 'https://event-schedular-agent-98441850389.asia-south1.run.app',
        changeOrigin: true,
        secure: false,
        // Add timeout for better error handling
        timeout: 10000,
        // Log proxy requests in development
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
        }
      }
    },
    // Better error overlay
    overlay: {
      warnings: false,
      errors: true
    }
  },

  // Build optimizations for production
  build: {
    // Generate sourcemaps for better debugging
    sourcemap: false,
    
    // Optimize bundle size
    rollupOptions: {
      output: {
        // Better chunk splitting for caching
        manualChunks: {
          // Vendor chunks
          react: ['react', 'react-dom'],
          router: ['react-router-dom'],
          
          // UI components chunk
          ui: ['./src/components/ChatMessage.jsx', './src/components/ChatBar.jsx', './src/components/Header.jsx'],
        },
        
        // Better asset naming
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? 
            chunkInfo.facadeModuleId.split('/').pop().replace('.jsx', '').replace('.js', '') : 
            'chunk';
          return `js/${facadeModuleId}-[hash].js`;
        },
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/\.(mp3|wav|ogg|mp4|webm|mov)$/.test(assetInfo.name)) {
            return `media/[name]-[hash].${ext}`;
          }
          if (/\.(png|jpe?g|gif|svg|webp|ico)$/.test(assetInfo.name)) {
            return `images/[name]-[hash].${ext}`;
          }
          if (/\.(woff2?|eot|ttf|otf)$/.test(assetInfo.name)) {
            return `fonts/[name]-[hash].${ext}`;
          }
          return `assets/[name]-[hash].${ext}`;
        }
      }
    },
    
    // Increase chunk size warning limit for modern UI
    chunkSizeWarningLimit: 1000,
    
    // Better minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true
      }
    },

    // Asset optimization
    assetsInlineLimit: 4096, // Inline assets smaller than 4kb
  },

  // CSS configuration
  css: {
    // Better CSS processing
    preprocessorOptions: {
      css: {
        charset: false
      }
    },
    // PostCSS plugins (already handled by Tailwind)
    postcss: './postcss.config.js'
  },

  // Dependency optimization
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom'
    ],
    exclude: [
      // Exclude any problematic dependencies from pre-bundling if needed
    ]
  },

  // Environment variables
  define: {
    // Make environment variables available to the app
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
  },

  // Experimental features for better performance
  esbuild: {
    // Better JSX handling
    jsx: 'automatic',
    // Remove unused imports in production
    treeShaking: true,
    // Better dead code elimination
    ...(process.env.NODE_ENV === 'production' && {
      drop: ['console', 'debugger']
    })
  },

  // Preview server configuration (for production builds)

  preview: {
    host: '0.0.0.0',
    port: 8080
  }
})