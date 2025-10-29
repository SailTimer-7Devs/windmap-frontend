import { type ReactElement } from 'react'
import { jwtDecode } from "jwt-decode"

import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import { Toaster } from 'sonner'

import { client, isDevMode } from 'bootstrap'

import Mapbox from 'components/Mapbox'
import SignInForm from 'forms/SignIn'
import LoginTemplate from 'templates/Login'

import { getUrlParams } from 'lib/url'

import { useAuthStore } from 'store/auth'

const ID_TOKEN_PARAM = 'idToken'

export default function App(): ReactElement {
  const idToken = getUrlParams(ID_TOKEN_PARAM, '')

  console.info({ paramsIdToken: idToken })

  const { currentUser, signOut, authUser } = useAuthStore()

  React.useEffect(() => {
    if (idToken) {
      const decoded = jwtDecode<{ aud: string; email: string }>(idToken)
      const localStorageKey = ['CognitoIdentityServiceProvider', decoded.aud, decoded.email].join('.')
      const IdTokenKey = [localStorageKey, 'idToken'].join('.')
      const lastAuthUserKey = [localStorageKey,'LastAuthUser'].join('.')

      localStorage.setItem(IdTokenKey, idToken)
      localStorage.setItem(lastAuthUserKey, decoded.email)

      const url = new URL(window.location.href)
      url.searchParams.delete(ID_TOKEN_PARAM)
      window.history.replaceState({}, document.title, url.toString())
    }

    authUser()
  }, [])

  return (
    <QueryClientProvider client={client}>
      <div className='relative w-full h-dvh flex items-center justify-center'>
        {currentUser.isAuthorized
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
