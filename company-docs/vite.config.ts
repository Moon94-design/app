import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? ''
const isGitHubActions = process.env.GITHUB_ACTIONS === 'true'

// https://vite.dev/config/
export default defineConfig({
  base: isGitHubActions && repoName ? `/${repoName}/` : '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@kernel': path.resolve(__dirname, 'src2/kernel'),
      '@app2': path.resolve(__dirname, 'src2/app'),
      '@legacy': path.resolve(__dirname, 'src'),
    },
  },
})
