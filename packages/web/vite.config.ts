import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(currentDir, '../..');

export default defineConfig(({ mode }) => {
  // The FinLens .env lives at the repo root, not in this package. Load it so the
  // dev server's port and API proxy target follow the same config the API uses.
  const rootEnv = loadEnv(mode, repoRoot, '');
  const apiPort = rootEnv.API_PORT ?? '3001';
  const apiTarget = process.env.API_PROXY_TARGET ?? rootEnv.API_PROXY_TARGET ?? `http://localhost:${apiPort}`;
  const webPort = Number(process.env.WEB_PORT ?? rootEnv.WEB_PORT ?? 5174);

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(currentDir, './src')
      }
    },
    server: {
      host: true,
      port: webPort,
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true
        }
      }
    }
  };
});
