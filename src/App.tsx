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
  const idToken = React.useRef(getUrlParams(ID_TOKEN_PARAM, '')).current

  const { isLoading, authUser } = useAuthStore()

  React.useEffect(() => {
    let handoffIdToken: string | undefined

    if (idToken) {
      try {
        const decoded = jwtDecode<{
          aud?: string
          email?: string
          exp?: number
          iss?: string
          sub?: string
          'cognito:username'?: string
        }>(idToken)
        const userPoolId = import.meta.env.VITE_COGNITO_USER_POOL_ID
        const region = userPoolId.split('_', 1)[0]
        const expectedIssuer = `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`

        // The iOS app and this website intentionally use different Cognito
        // app clients in the same user pool. Trust the pool issuer here and
        // let /sign-cookies verify the token signature; requiring the web
        // client's aud rejects a valid native-app handoff and sends the user
        // back to /login every time Wind or WNI is opened.
        if (!decoded.aud || decoded.iss !== expectedIssuer) {
          throw new Error('The app token belongs to a different Cognito user pool')
        }

        if (!decoded.exp || decoded.exp * 1000 <= Date.now()) {
          throw new Error('The app token has expired')
        }

        const username = decoded['cognito:username'] || decoded.email || decoded.sub

        if (username) {
          const storagePrefix = `CognitoIdentityServiceProvider.${decoded.aud}`
          localStorage.setItem(`${storagePrefix}.${username}.idToken`, idToken)
          localStorage.setItem(`${storagePrefix}.LastAuthUser`, username)
        }

        // The backend validates the signed token. Email is not a required ID
        // token claim, so a valid native-app handoff must not depend on it.
        handoffIdToken = idToken
      } catch (error) {
        console.error('[App] Invalid ID token received from app:', error)
      } finally {
        const url = new URL(window.location.href)
        url.searchParams.delete(ID_TOKEN_PARAM)
        window.history.replaceState({}, document.title, url.toString())
      }
    }

    authUser(handoffIdToken)
  }, [authUser, idToken])

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
