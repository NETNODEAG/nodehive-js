import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3301,
    open: true
  },
  resolve: {
    alias: {
      'nodehive-js': path.resolve(__dirname, '../package/index.js'),
      '@': path.resolve(__dirname, './src')
    }
  }
})