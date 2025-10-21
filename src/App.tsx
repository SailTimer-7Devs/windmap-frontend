import { type ReactElement } from 'react'

import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import { Toaster } from 'sonner'

import { client, isDevMode } from 'bootstrap'

import Mapbox from 'components/Mapbox'
import SignInForm from 'forms/SignIn'
import LoginTemplate from 'templates/Login'

import { getCookies } from 'lib/cookies'
import { getUrlParams } from 'lib/url'

import { useAuthStore } from 'store/auth'

const ACCESS_TOKEN_PARAM = 'accessToken'

export default function App(): ReactElement {
  const accessToken = getUrlParams(ACCESS_TOKEN_PARAM, '')

  console.info({ paramsToken: accessToken })

  const { currentUser, signOut } = useAuthStore()
  getCookies(accessToken)

  React.useEffect(() => {
    if (accessToken) {
      const url = new URL(window.location.href)
      url.searchParams.delete(ACCESS_TOKEN_PARAM)
      window.history.replaceState({}, document.title, url.toString())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <QueryClientProvider client={client}>
      <div className='relative w-full h-dvh flex items-center justify-center'>
        {accessToken || currentUser.isAuthorized
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

        <button onClick={signOut}>Sign out</button>
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
