import type { CurrentUser, SignInPayload } from 'types/user'

import { create } from 'zustand'

import { Amplify } from 'aws-amplify'
import { fetchAuthSession } from 'aws-amplify/auth'

import {
  signIn as amplifySignIn,
  signOut as amplifySignOut
  // getCurrentUser
} from 'aws-amplify/auth'

import { getCookies } from 'lib/cookies'
import { notifySuccess, notifyError } from 'lib/toast'

const userPoolId = import.meta.env.VITE_COGNITO_USER_POOL_ID
const userPoolClientId = import.meta.env.VITE_COGNITO_USER_POOL_CLIENT_ID

if (!userPoolId || !userPoolClientId) {
  throw new Error('Missing env variables: COGNITO_USER_POOL_*')
}

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
      userPoolClientId: import.meta.env.VITE_COGNITO_USER_POOL_CLIENT_ID
    }
  }
})

const messages = {
  signInSuccess: 'You have successfully signed in',
  signInNotConfirmed: 'Account is not confirmed',
  signInError: 'Invalid email or password',
  signOutSuccess: 'You have successfully signed out'
}

interface AuthStore {
  currentUser: Partial<CurrentUser>
  isLoading: boolean

  authUser: () => Promise<void>

  signIn: (payload: SignInPayload) => Promise<void>
  signOut: () => Promise<void>
}

const initialUser: Partial<CurrentUser> = {
  isAuthorized: false
}

export const useAuthStore = create<AuthStore>((set) => ({
  currentUser: initialUser,
  isLoading: true,

  authUser: async () => {
    try {
      const session = await restoreAmplifySession()
      const { idToken, from } = session || {}
      if (idToken) {
        await getCookies(idToken)
        set({
          currentUser: {
            isAuthorized: true
          },
          isLoading: false
        })
        console.info(`[authUser] Authorized via ${from}`)
      } else {
        set({
          currentUser: {
            isAuthorized: false
          },
          isLoading: false
        })
        console.info('[authUser] No active session')
      }
    } catch (error) {
      console.error('[authUser] unexpected error:', error)
      set({
        currentUser: initialUser,
        isLoading: false
      })
    }
  },

  signIn: async (payload: SignInPayload) => {
    try {
      const { isSignedIn, nextStep } = await amplifySignIn({
        username: payload.email,
        password: payload.password,
        options: {
          authFlowType: 'USER_PASSWORD_AUTH'
        }
      })

      const isNotConfirmed = nextStep.signInStep === 'CONFIRM_SIGN_UP'
      if (isSignedIn) {
        // It's necessary to use idToken for API Gateway authorizer
        const session = await fetchAuthSession()
        const idToken = session.tokens?.idToken?.toString()
        if (!idToken) throw new Error('Missing ID token')
        await getCookies(idToken)

        set({
          currentUser: {
            isAuthorized: true
          },
          isLoading: false
        })
        notifySuccess(messages.signInSuccess)
      } else if (isNotConfirmed) {
        notifySuccess(messages.signInNotConfirmed)
      } else {
        console.error('signIn:', nextStep)
      }
    } catch (err) {
      notifyError(messages.signInError)
      console.error('signIn:', err)
    }
  },

  signOut: async () => {
    try {
      await amplifySignOut()

      set({
        currentUser: initialUser,
        isLoading: false
      })
      notifySuccess(messages.signOutSuccess)
    } catch (err) {
      set({
        currentUser: initialUser,
        isLoading: false
      })
      console.error('signOut', err)
    }
  }
}))

function getIdTokenFromLocalStorage() {
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.includes('idToken')) {
      const value = localStorage.getItem(key)
      return { key, value }
    }
  }
  return null
}

async function restoreAmplifySession() {
  try {
    const session = await fetchAuthSession()
    const idToken = session.tokens?.idToken?.toString()
    if (idToken) {
      console.info('[restoreAmplifySession] Active session restored from Amplify')
      return { idToken, from: 'amplify' }
    }
  } catch (error) {
    const err = error as { name?: string }
    if (err.name === 'UserUnAuthenticatedException') {
      console.warn('[restoreAmplifySession] No active session in Amplify')
    } else {
      console.error('[restoreAmplifySession] Unexpected error:', error)
    }
  }

  try {
    const tokenData = getIdTokenFromLocalStorage()
    if (tokenData && tokenData.value) {
      const { key: tokenKey, value: idToken } = tokenData
      console.info(`[restoreAmplifySession] idToken restored from localStorage key: ${tokenKey}`)
      return { idToken, from: 'localStorage' }
    }
  } catch (error) {
    console.error('[restoreAmplifySession] Failed to read idToken from localStorage:', error)
  }
}
