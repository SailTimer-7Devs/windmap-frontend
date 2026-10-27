import assert from 'node:assert/strict'
import { build } from 'esbuild'

const fixture = {
  signedIn: false,
  cookieStatus: 403,
  signInCalls: 0,
  cookieCalls: 0,
  notifications: [],
  rejectCredentials: false
}
globalThis.signInFixture = fixture
const storage = new Map()
globalThis.localStorage = {
  getItem: key => storage.get(key) ?? null,
  setItem: (key, value) => storage.set(key, value),
  removeItem: key => storage.delete(key)
}

const result = await build({
  entryPoints: ['src/store/auth.ts'], bundle: true, platform: 'node', format: 'esm',
  write: false, nodePaths: ['src'],
  define: {
    'import.meta.env.VITE_COGNITO_USER_POOL_ID': '"us-east-2_test"',
    'import.meta.env.VITE_COGNITO_USER_POOL_CLIENT_ID': '"web-client"'
  },
  plugins: [{ name: 'auth-fixtures', setup(build) {
    build.onResolve({ filter: /^(aws-amplify(\/auth)?|lib\/cookies|lib\/toast)$/ }, args => ({ path: args.path, namespace: 'fixture' }))
    build.onLoad({ filter: /.*/, namespace: 'fixture' }, args => ({ contents:
      args.path === 'aws-amplify' ? 'export const Amplify={configure(){}}' :
      args.path === 'aws-amplify/auth' ? `
        export async function signIn() {
          const f = globalThis.signInFixture; f.signInCalls++;
          if (f.rejectCredentials) throw Object.assign(new Error('Wrong password'), {name:'NotAuthorizedException'});
          if (f.signedIn) throw Object.assign(new Error('Already signed in'), {name:'UserAlreadyAuthenticatedException'});
          f.signedIn = true;
          return {isSignedIn:true,nextStep:{signInStep:'DONE'}};
        }
        export async function fetchAuthSession() {return {tokens:globalThis.signInFixture.signedIn ? {idToken:{toString(){return 'test-id-token'}}} : undefined}}
        export async function signOut() {globalThis.signInFixture.signedIn = false}
        export async function signUp(){}; export async function confirmSignUp(){};
        export async function resetPassword(){}; export async function confirmResetPassword(){};
      ` :
      args.path === 'lib/cookies' ? `
        export class CookieExchangeError extends Error {constructor(status){super('status '+status);this.status=status}}
        export async function getCookies(){const f=globalThis.signInFixture;f.cookieCalls++;if(f.cookieStatus)throw new CookieExchangeError(f.cookieStatus)}
      ` :
      'export function notifySuccess(message){globalThis.signInFixture.notifications.push(["success",message])};export function notifyError(message){globalThis.signInFixture.notifications.push(["error",message])}'
    }))
  } }]
})

const { useAuthStore } = await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`)
const store = useAuthStore.getState()
const originalWarn = console.warn
const originalError = console.error
console.warn = () => {}
console.error = () => {}
try {
  await store.signIn({ email: 'test@example.com', password: 'correct-password' })
  assert.equal(fixture.signedIn, true, 'Cognito accepted the credentials')
  assert.equal(useAuthStore.getState().currentUser.appSessionIssue, 'subscription')
  assert.equal(fixture.notifications.length, 0, '403 must not be called a wrong password')

  await useAuthStore.getState().authUser()
  assert.equal(useAuthStore.getState().currentUser.appSessionIssue, 'subscription', 'reload restores the subscription notice')
  assert.equal(fixture.signInCalls, 1, 'retry uses the saved session, not Cognito signIn again')

  fixture.cookieStatus = 0
  await useAuthStore.getState().authUser()
  assert.equal(useAuthStore.getState().currentUser.isAuthorized, true, 'Check again opens the map once entitled')

  await useAuthStore.getState().signOut()
  assert.equal(fixture.signedIn, false, 'Sign out lets the user switch accounts')
  assert.equal(useAuthStore.getState().currentUser.isAuthorized, false)

  fixture.cookieStatus = 500
  await store.signIn({ email: 'test@example.com', password: 'correct-password' })
  assert.equal(useAuthStore.getState().currentUser.appSessionIssue, 'unavailable', 'server failure is not bad credentials')
  assert.equal(fixture.notifications.filter(([kind]) => kind === 'error').length, 0)

  await store.signIn({ email: 'test@example.com', password: 'correct-password' })
  assert.equal(useAuthStore.getState().currentUser.appSessionIssue, 'unavailable', 'already signed in restores the existing session')
  assert.equal(fixture.notifications.filter(([kind]) => kind === 'error').length, 0)

  await useAuthStore.getState().signOut()
  fixture.rejectCredentials = true
  await store.signIn({ email: 'test@example.com', password: 'wrong-password' })
  assert.equal(fixture.notifications.at(-1)[1], 'Invalid email or password', 'actual credential rejection keeps the original message')
} finally {
  console.warn = originalWarn
  console.error = originalError
}
console.log('Production sign-in subscription, retry, sign-out, server error and wrong-password checks passed.')
