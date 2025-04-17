import { defineConfig } from 'vite'

import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  resolve: {
    alias: {
      'src': path.resolve(__dirname, './src'),
      'components': path.resolve(__dirname, './src/components'),
      'constants': path.resolve(__dirname, './src/constants'),
      'lib': path.resolve(__dirname, './src/lib'),
      'types': path.resolve(__dirname, './src/types'),
      'icons': path.resolve(__dirname, './src/icons'),
      'hooks': path.resolve(__dirname, './src/hooks')
    }
  }
})
