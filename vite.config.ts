import { defineConfig, loadEnv } from 'vite'

import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

const STAGE = process.env.STAGE || 'dev'

// https://vitejs.dev/config/
export default ({ mode }: { mode: string }): ReturnType<typeof defineConfig> => {
  process.env = {
    ...process.env,
    ...mapEnvVars({
      STAGE,
      API_URL: process.env.API_URL,
      S3_DATA: process.env.S3_DATA,
      COGNITO_USER_POOL_ID: process.env.COGNITO_USER_POOL_ID,
      COGNITO_USER_POOL_CLIENT_ID: process.env.COGNITO_USER_POOL_CLIENT_ID
    }),
    ...loadEnv(mode, process.cwd())
  }

  return defineConfig({
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
        'hooks': path.resolve(__dirname, './src/hooks'),
        'assets': path.resolve(__dirname, './src/assets'),
        'bootstrap': path.resolve(__dirname, './src/bootstrap'),
        'fields': path.resolve(__dirname, './src/fields'),
        'forms': path.resolve(__dirname, './src/forms'),
        'sections': path.resolve(__dirname, './src/sections'),
        'store': path.resolve(__dirname, './src/store'),
        'templates': path.resolve(__dirname, './src/templates')
      }
    },
    build: {
      chunkSizeWarningLimit: 1700,
      rollupOptions: {
        output: {
          manualChunks: {
            'deck-chunk': ['deck.gl', '@deck.gl/mapbox', '@deck.gl/extensions'],
            'mapbox-chunk': ['mapbox-gl'],
            'weatherlayers-gl-chunk': ['weatherlayers-gl']
          }
        }
      }
    }
  })
}

function mapEnvVars(vars: Record<string, unknown>) {
  const viteVars: Record<string, string | undefined> = {}

  for (const [key, value] of Object.entries(vars)) {
    viteVars[`VITE_${key}`] = value?.toString()
  }

  return viteVars
}
