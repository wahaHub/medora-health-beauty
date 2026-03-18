import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        proxy: {
          '/api/patient': {
            target: 'http://localhost:3001',
            changeOrigin: true,
          },
          '/ws': {
            target: 'ws://localhost:3001',
            ws: true,
          },
        },
      },
      plugins: [
        react(),
        viteStaticCopy({
          targets: [
            {
              src: 'admin/public/*',
              dest: 'admin'
            }
          ]
        })
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
