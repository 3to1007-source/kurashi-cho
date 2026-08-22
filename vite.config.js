import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages(https://<owner>.github.io/shiori/)にサブパスで配信するため、
// ビルド時のみベースパスを合わせる。ローカルの `vite` (dev)はそのまま `/` で動く。
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/shiori/' : '/',
  plugins: [react()],
}))
