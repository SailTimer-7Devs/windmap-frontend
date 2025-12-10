import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router/dom'
import { QueryClientProvider } from '@tanstack/react-query'
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import './index.scss'

import { router, client } from 'bootstrap'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={client}>
      <RouterProvider router={router} />

      {/* {isDevMode && <ReactQueryDevtools />} */}
    </QueryClientProvider>
  </StrictMode>
)
