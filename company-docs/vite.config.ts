import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@kernel': path.resolve(__dirname, 'src2/kernel'),
      '@app2': path.resolve(__dirname, 'src2/app'),
      '@legacy': path.resolve(__dirname, 'src'),
    },
  },
})
