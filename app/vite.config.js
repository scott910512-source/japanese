import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages는 https://<user>.github.io/japanese/ 경로로 서빙되므로 base 지정
export default defineConfig({
  base: '/japanese/',
  plugins: [react()],
})
