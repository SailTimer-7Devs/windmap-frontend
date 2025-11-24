import type { RouterProviderProps } from 'react-router/dom'

import { QueryClient } from '@tanstack/react-query'
import { createBrowserRouter } from 'react-router'

import Application from './App'
import routes from 'routes'

export const client = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: import.meta.env.PROD
    }
  }
})

export const isDevMode = import.meta.env.MODE === 'development'

export const router: RouterProviderProps['router'] = createBrowserRouter([
  {
    path: '/',
    element: <Application />,
    children: routes
  }
])
