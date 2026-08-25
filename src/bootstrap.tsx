import type { RouterProviderProps } from 'react-router/dom'

import { QueryClient } from '@tanstack/react-query'
import { createBrowserRouter } from 'react-router'

import Application from './App'
import routes from 'routes'
import WeatherOverlay from 'components/WeatherOverlay/WeatherOverlay'

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
    path: '/overlay/weather',
    element: <WeatherOverlay />
  },
  {
    path: '/poc/inavx-overlay',
    element: <WeatherOverlay />
  },
  {
    path: '/',
    element: <Application />,
    children: routes
  }
])
