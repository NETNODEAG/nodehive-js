import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import dts from 'vite-plugin-dts';
import path from 'path';
import retainUseClientDirective from './plugins/retainUseClientDirective';


// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      name: 'nodehive-react',
      entry: path.resolve(__dirname, 'index.ts'),
      fileName: (format) => `index.${format}.js`,
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
    sourcemap: false,
    emptyOutDir: true,
  },
  plugins: [react(), dts(),retainUseClientDirective()],
});