import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  // Python AI backend (RAG, Agents, NLP)
  const aiTarget = env.AI_TARGET_URL || 'http://127.0.0.1:5000';
  // Node.js API backend (Auth, Courses, Assessments, Events, Users, Analytics)
  const apiTarget = env.API_TARGET_URL || 'http://127.0.0.1:4000';

  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      target: 'es2020',
      cssCodeSplit: true,
      chunkSizeWarningLimit: 800,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('react-dom') || id.includes('react/') || id.includes('react-router-dom') || id.includes('react-helmet-async')) {
                return 'vendor-react';
              }
              if (id.includes('gsap')) {
                return 'vendor-gsap';
              }
              if (id.includes('lucide-react')) {
                return 'vendor-icons';
              }
              if (id.includes('katex')) {
                return 'vendor-katex';
              }
            }
          },
        },
      },
    },
    server: {
      host: '0.0.0.0',
      port: 5173,
      proxy: {
        // ── AI Backend (Python) ──────────────────────────
        '/api/v1/agent': { target: aiTarget, changeOrigin: true },
        '/api/v1/nlp':   { target: aiTarget, changeOrigin: true },
        '/api/v1/data':  { target: aiTarget, changeOrigin: true },
        '/api/v1/admin/task':       { target: aiTarget, changeOrigin: true },
        '/api/v1/admin/guidelines': { target: aiTarget, changeOrigin: true },
        '/api/v1/admin/health':     { target: aiTarget, changeOrigin: true },
        // ── Node.js API (everything else) ────────────────
        '/api': { target: apiTarget, changeOrigin: true },
      },
    },
  };
})

