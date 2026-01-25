import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    build: {
        outDir: 'assets/build',
        emptyOutDir: true,
        manifest: true,
        rollupOptions: {
            input: {
                admin: path.resolve(__dirname, 'assets/src/admin/main.tsx'),
            },
            output: {
                entryFileNames: `[name].js`,
                chunkFileNames: `[name].js`,
                assetFileNames: `[name].[ext]`,
            },
        },
        // Don't use watch in production build - use `npm run dev` for HMR
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './assets/src'),
        },
    },
});
