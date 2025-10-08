import { QueryClient } from '@tanstack/react-query'

export const client = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: import.meta.env.PROD
    }
  }
})

export const isDevMode = import.meta.env.MODE === 'development'
