import { type ReactElement } from 'react'
import { jwtDecode } from 'jwt-decode'

import React from 'react'
import { Outlet } from 'react-router'
import { Toaster } from 'sonner'

import Spinner from 'components/Spinner'

import { getUrlParams } from 'lib/url'

import { useAuthStore } from 'store/auth'

const ID_TOKEN_PARAM = 'idToken'

export default function App(): ReactElement {
  const idToken = getUrlParams(ID_TOKEN_PARAM, '')

  const { isLoading, authUser } = useAuthStore()

  React.useEffect(() => {
    if (idToken) {
      const decoded = jwtDecode<{ aud: string; email: string }>(idToken)
      const localStorageKey = ['CognitoIdentityServiceProvider', decoded.aud, decoded.email].join('.')
      const IdTokenKey = [localStorageKey, 'idToken'].join('.')
      const lastAuthUserKey = [localStorageKey, 'LastAuthUser'].join('.')

      localStorage.setItem(IdTokenKey, idToken)
      localStorage.setItem(lastAuthUserKey, decoded.email)

      const url = new URL(window.location.href)
      url.searchParams.delete(ID_TOKEN_PARAM)
      window.history.replaceState({}, document.title, url.toString())
    }

    authUser()
  }, [])

  return (
    <>
      {isLoading
        ? (
          <div className='relative w-full h-dvh flex items-center justify-center'>
            <Spinner show={isLoading} />
          </div>)
        : <Outlet />}

      <Toaster
        richColors
        toastOptions={{
          classNames: {
            toast: '!w-fit max-w-[350px]'
          }
        }}
      />
    </>
  )
}
