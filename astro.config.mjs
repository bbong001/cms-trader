import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: node({
    mode: 'standalone',
  }),
  server: {
    host: true, // Listen on 0.0.0.0
    port: 4322,
  },
  integrations: [react(), tailwind()],
  vite: {
    ssr: {
      // Externalize Prisma in dev mode to avoid CommonJS/ESM issues
      // In production (Docker), we can bundle or externalize
      noExternal: process.env.NODE_ENV === 'production' 
        ? ['socket.io-client']
        : ['socket.io-client'],
    },
    optimizeDeps: {
      exclude: ['@prisma/client', '@prisma/adapter-pg', 'pg'],
    },
    resolve: {
      alias: {},
    },
    build: {
      commonjsOptions: {
        transformMixedEsModules: true,
      },
      rollupOptions: {
        external: ['@prisma/client', '@prisma/adapter-pg', 'pg'],
      },
    },
  },
});

