import { type ReactElement } from 'react'
import { jwtDecode } from 'jwt-decode'

import React from 'react'
import { Outlet } from 'react-router'
import { Toaster } from 'sonner'

import Spinner from 'components/Spinner'

import { getUrlParams } from 'lib/url'

import { useAuthStore } from 'store/auth'

const ID_TOKEN_PARAM = 'idToken'

const APP_SESSION_AUTO_RETRY_MS = 20000

// Shown to SailTimer-app users instead of the web login page when the weather
// session cannot be established yet. Retries on its own and on demand.
function AppSessionNotice({ issue, onRetry }: {
  issue: 'activation' | 'unavailable'
  onRetry: () => Promise<void>
}): ReactElement {
  const [isRetrying, setIsRetrying] = React.useState(false)
  const busyRef = React.useRef(false)

  // One attempt at a time: manual and automatic retries never overlap.
  const retry = React.useCallback(async () => {
    if (busyRef.current) return
    busyRef.current = true
    setIsRetrying(true)
    try {
      await onRetry()
    } finally {
      busyRef.current = false
      setIsRetrying(false)
    }
  }, [onRetry])

  // The next automatic retry is scheduled only after the previous one ends.
  React.useEffect(() => {
    if (isRetrying) return
    const timer = window.setTimeout(retry, APP_SESSION_AUTO_RETRY_MS)
    return () => window.clearTimeout(timer)
  }, [isRetrying, retry])

  return (
    <div className='w-full h-dvh flex items-center justify-center p-6'>
      <div className='max-w-sm rounded bg-gray-900/90 px-4 py-3 text-center text-sm text-white shadow-lg'>
        <p>
          {issue === 'activation'
            ? 'Your subscription is still being activated. The map will open automatically.'
            : 'The weather service could not be reached. The map will open automatically when the connection returns.'}
        </p>
        <button
          type='button'
          className='mt-3 rounded bg-white px-3 py-1.5 font-semibold text-gray-900 disabled:opacity-60'
          onClick={retry}
          disabled={isRetrying}
        >
          {isRetrying ? 'Trying…' : 'Try again'}
        </button>
      </div>
    </div>
  )
}

export default function App(): ReactElement {
  const idToken = React.useRef(getUrlParams(ID_TOKEN_PARAM, '')).current

  const { isLoading, authUser, currentUser } = useAuthStore()
  const appSessionToken = currentUser.appSessionToken
  const retryAppSession = React.useCallback(
    () => authUser(appSessionToken),
    [authUser, appSessionToken]
  )

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

        // authUser persists the native handoff only after the server accepts
        // it. Do not manufacture an Amplify login under another client ID.
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
        : currentUser.appSessionIssue
          ? <AppSessionNotice
              issue={currentUser.appSessionIssue}
              onRetry={retryAppSession}
            />
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
