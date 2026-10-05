import type {
  CurrentUser,
  SignInPayload,
  ResetPasswordPayload,
  SignUpPayload,
  ConfirmSignUpPayload
} from 'types/user'

import { create } from 'zustand'

import { Amplify } from 'aws-amplify'
import { fetchAuthSession } from 'aws-amplify/auth'

import {
  signIn as amplifySignIn,
  signOut as amplifySignOut,
  signUp as amplifySignUp,
  confirmSignUp as amplifyConfirmSignUp,
  resetPassword
} from 'aws-amplify/auth'

import { CookieExchangeError, getCookies } from 'lib/cookies'
import { NATIVE_ID_TOKEN_KEY, usableNativeIdToken } from 'lib/nativeSession'
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

/* Preserve username casing for accounts created before email normalization;
   Cognito pools may be configured with case-sensitive usernames. */
function normalizeEmail(email: string): string {
  return email.trim()
}

const messages = {
  signInSuccess: 'You have successfully signed in',
  signInNotConfirmed: 'Account is not confirmed',
  signInError: 'Invalid email or password',
  signOutSuccess: 'You have successfully signed out',
  resetPasswordSuccess: 'Password reset email sent',
  resetPasswordError: 'Failed to send password reset email',
  signUpSuccess: 'Email verification sent',
  signUpError: 'Unable to create the account. Please check your details and try again.',
  confirmSignUpSuccess: 'Account verified. You can now sign in.',
  confirmSignUpError: 'The verification code is invalid or has expired.'
}

interface AuthStore {
  currentUser: Partial<CurrentUser>
  isLoading: boolean

  authUser: (idToken?: string) => Promise<void>

  signIn: (payload: SignInPayload) => Promise<void>
  resetPassword: (payload: ResetPasswordPayload) => Promise<void>
  signUp: (payload: SignUpPayload) => Promise<void>
  confirmSignUp: (payload: ConfirmSignUpPayload) => Promise<void>
  signOut: () => Promise<void>
}

const initialUser: Partial<CurrentUser> = {
  isAuthorized: false
}

export const useAuthStore = create<AuthStore>((set) => ({
  currentUser: initialUser,
  isLoading: true,

  authUser: async (handoffIdToken?: string) => {
    try {
      let session = handoffIdToken
        ? { idToken: handoffIdToken, from: 'app handoff' }
        : await restoreAmplifySession()
      const fromNativeApp = !!handoffIdToken || session?.from === 'saved native handoff'

      if (session?.idToken) {
        try {
          if (fromNativeApp) {
            await getCookiesAwaitingSubscription(session.idToken)
          } else {
            await getCookies(session.idToken)
          }
          if (handoffIdToken) {
            try { localStorage.setItem(NATIVE_ID_TOKEN_KEY, handoffIdToken) } catch { /* Native app can supply it again. */ }
          }
        } catch (handoffError) {
          // The app proved who the user is. A 403 means the subscription
          // record has not reached SailTimer's server yet; other failures are
          // server or network problems. The web login page cannot fix either,
          // so app users get a retryable message instead.
          if (fromNativeApp) {
            const activation = isSubscriptionNotRecorded(handoffError)
            console.warn(`[authUser] App session not established (${activation ? 'activation' : 'unavailable'})`)
            set({
              currentUser: {
                isAuthorized: false,
                appSessionIssue: activation ? 'activation' : 'unavailable',
                appSessionToken: session.idToken
              },
              isLoading: false
            })
            return
          }
          if (!handoffIdToken) throw handoffError

          console.warn('[authUser] App handoff failed; trying saved web session')
          const savedSession = await restoreAmplifySession()
          if (!savedSession?.idToken || savedSession.idToken === handoffIdToken) {
            throw handoffError
          }

          await getCookies(savedSession.idToken)
          session = savedSession
        }
      }

      const { idToken, from } = session || {}

      if (idToken) {
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
        username: normalizeEmail(payload.email),
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
        localStorage.removeItem(NATIVE_ID_TOKEN_KEY)

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

  resetPassword: async (payload: ResetPasswordPayload) => {
    try {
      await resetPassword({ username: normalizeEmail(payload.email) })
    } catch (err) {
      notifyError(messages.resetPasswordError)
      console.error('resetPassword:', err)
    }
  },

  signUp: async (payload: SignUpPayload) => {
    try {
      await amplifySignUp({
        username: normalizeEmail(payload.email),
        password: payload.password,
        options: {
          userAttributes: {
            email: normalizeEmail(payload.email)
          }
        }
      })
      notifySuccess(messages.signUpSuccess)
    } catch (err) {
      notifyError(messages.signUpError)
      console.error('signUp:', err)
      throw err
    }
  },

  confirmSignUp: async (payload: ConfirmSignUpPayload) => {
    try {
      await amplifyConfirmSignUp({
        username: normalizeEmail(payload.email),
        confirmationCode: payload.confirmationCode.trim()
      })
      notifySuccess(messages.confirmSignUpSuccess)
    } catch (err) {
      notifyError(messages.confirmSignUpError)
      console.error('confirmSignUp:', err)
      throw err
    }
  },

  signOut: async () => {
    localStorage.removeItem(NATIVE_ID_TOKEN_KEY)
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

const SUBSCRIPTION_RETRY_DELAYS_MS = [1500, 2500, 4000, 6000, 8000]

function isSubscriptionNotRecorded(error: unknown): boolean {
  return error instanceof CookieExchangeError && error.status === 403
}

// 403 (record not written yet), 5xx and network failures/timeouts can clear up
// on their own; 401 means the token itself was rejected and will not.
function isRetryable(error: unknown): boolean {
  return error instanceof CookieExchangeError &&
    (error.status === 403 || error.status === 0 || error.status >= 500)
}

// Upper bound on the spinner, including slow or timed-out requests.
const APP_SESSION_DEADLINE_MS = 30000

// Right after a purchase, or when an App Store renewal is being recorded, the
// app opens the map while SailTimer's server is still writing the subscription.
// Wait for it instead of failing the first /sign-cookies attempt.
async function getCookiesAwaitingSubscription(
  idToken: string,
  delays: number[] = SUBSCRIPTION_RETRY_DELAYS_MS,
  deadlineMs: number = APP_SESSION_DEADLINE_MS
): Promise<void> {
  const deadline = Date.now() + deadlineMs
  for (let attempt = 0; ; attempt++) {
    try {
      await getCookies(idToken)
      return
    } catch (error) {
      if (!isRetryable(error) || attempt >= delays.length ||
          Date.now() + delays[attempt] > deadline) throw error
      await new Promise(resolve => setTimeout(resolve, delays[attempt]))
    }
  }
}

function getConfiguredIdTokenFromLocalStorage() {
  const storagePrefix = `CognitoIdentityServiceProvider.${userPoolClientId}`
  const lastAuthUser = localStorage.getItem(`${storagePrefix}.LastAuthUser`)
  if (!lastAuthUser) return null

  const tokenKey = `${storagePrefix}.${lastAuthUser}.idToken`
  const idToken = localStorage.getItem(tokenKey)

  return idToken ? { key: tokenKey, value: idToken } : null
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
    const tokenData = getConfiguredIdTokenFromLocalStorage()
    if (tokenData && usableNativeIdToken(tokenData.value, userPoolId)) {
      const { key: tokenKey, value: idToken } = tokenData
      console.info(`[restoreAmplifySession] idToken restored from localStorage key: ${tokenKey}`)
      return { idToken, from: 'localStorage' }
    }
  } catch (error) {
    console.error('[restoreAmplifySession] Failed to read idToken from localStorage:', error)
  }

  // Native tokens use another app-client ID and are not an Amplify login.
  // Preserve a server-accepted handoff across web reloads without inventing
  // an Amplify refresh session or reading tokens from arbitrary client keys.
  try {
    const idToken = usableNativeIdToken(localStorage.getItem(NATIVE_ID_TOKEN_KEY), userPoolId)
    if (idToken) return { idToken, from: 'saved native handoff' }
    localStorage.removeItem(NATIVE_ID_TOKEN_KEY)
  } catch {
    // Storage can be unavailable; the next native navigation supplies a token.
  }
}
