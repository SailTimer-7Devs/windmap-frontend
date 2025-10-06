import { type ReactElement } from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import { Toaster } from 'sonner'

import { client, isDevMode } from 'bootstrap'

import Mapbox from 'components/Mapbox'
import SignInForm from 'forms/SignIn'
import LoginTemplate from 'templates/Login'

import getUrlParams from 'lib/url'

import { useAuthStore } from 'store/auth'

export default function App(): ReactElement {
  const isAuthorized = !!getUrlParams('authorized', '')

  const { currentUser } = useAuthStore()

  return (
    <QueryClientProvider client={client}>
      <div className='relative w-full h-dvh flex items-center justify-center'>
        {isAuthorized || currentUser.isAuthorized
          ? <Mapbox />
          : (
            <LoginTemplate
              title='Welcome'
              description='In case you decide to use crowdsourced weather maps, please log in. You only need to log in once.'
            >
              <SignInForm />
            </LoginTemplate>
          )
        }
      </div>

      <Toaster
        richColors
        toastOptions={{
          classNames: {
            toast: '!w-fit max-w-[350px]'
          }
        }}
      />

      {isDevMode && <ReactQueryDevtools />}
    </QueryClientProvider>
  )
}
