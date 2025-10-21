import type { CurrentUser, SignInPayload } from 'types/user'

import { create } from 'zustand'

import { Amplify } from 'aws-amplify'
import { fetchAuthSession } from 'aws-amplify/auth'

import {
  signIn as amplifySignIn,
  signOut as amplifySignOut
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

  authUser: () => Promise<Partial<CurrentUser>>

  signIn: (payload: SignInPayload) => Promise<void>
  signOut: () => Promise<void>
}

const initialUser: Partial<CurrentUser> = {
  isAuthorized: false
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  currentUser: initialUser,
  isLoading: true,

  authUser: async () => {
    return get().currentUser
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
        const { accessToken } = (await fetchAuthSession()).tokens ?? {}

        console.info({ accessToken: accessToken?.toString() })
        await getCookies(accessToken?.toString() as string)

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

      set({ currentUser: initialUser, isLoading: false })
      notifySuccess(messages.signOutSuccess)
    } catch (err) {
      set({ currentUser: initialUser, isLoading: false })
      console.error('signOut', err)
    }
  }
}))
