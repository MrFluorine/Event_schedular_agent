import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react()],
  
  // Path aliases for cleaner imports (ESM compatible)
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@components': fileURLToPath(new URL('./src/components', import.meta.url)),
      '@pages': fileURLToPath(new URL('./src/pages', import.meta.url)),
      '@api': fileURLToPath(new URL('./src/api', import.meta.url)),
      '@utils': fileURLToPath(new URL('./src/utils', import.meta.url)),
      '@hooks': fileURLToPath(new URL('./src/hooks', import.meta.url)),
      '@context': fileURLToPath(new URL('./src/context', import.meta.url)),
      '@assets': fileURLToPath(new URL('./src/assets', import.meta.url))
    }
  },

  // Development server configuration
  server: {
    port: 5173,
    host: '0.0.0.0',
    strictPort: true,
    proxy: {
      '/api': {
        target: 'https://event-schedular-agent-98441850389.asia-south1.run.app',
        changeOrigin: true,
        secure: false,
        timeout: 10000
      }
    }
  },

  // Build optimizations for production
  build: {
    outDir: 'dist',
    sourcemap: false,
    
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          router: ['react-router-dom']
        },
        chunkFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
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
    
    chunkSizeWarningLimit: 1000,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    assetsInlineLimit: 4096
  },

  // Dependency optimization
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom']
  },

  // ESBuild configuration
  esbuild: {
    jsx: 'automatic',
    treeShaking: true,
    ...(process.env.NODE_ENV === 'production' && {
      drop: ['console', 'debugger']
    })
  }
})