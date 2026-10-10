import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import { pujoAiPlugin } from './server/pujoAiMiddleware.js'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [
      react(),
      pujoAiPlugin(env)
    ],
  };
})
