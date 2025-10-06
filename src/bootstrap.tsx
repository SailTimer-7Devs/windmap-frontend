import { QueryClient } from '@tanstack/react-query'

const apiUrl = import.meta.env.VITE_API_URL

if (!apiUrl) {
  throw new Error('Missing env variables: API_URL')
}

export const client = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: import.meta.env.PROD
    }
  }
})

export const isDevMode = import.meta.env.MODE === 'development'
