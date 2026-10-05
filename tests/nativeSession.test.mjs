import assert from 'node:assert/strict'
import { build } from 'esbuild'

const result = await build({ entryPoints: ['src/lib/nativeSession.ts'], bundle: true, platform: 'node', format: 'esm', write: false })
const { usableNativeIdToken } = await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`)
const now = 1800000000000
const pool = 'us-east-2_test'
const claims = { iss: `https://cognito-idp.us-east-2.amazonaws.com/${pool}`, aud: 'native-client', token_use: 'id', exp: now / 1000 + 3600 }
const token = values => `e30.${Buffer.from(JSON.stringify(values)).toString('base64url')}.unit-test-not-a-signature`
const valid = token(claims)
assert.equal(usableNativeIdToken(valid, pool, now), valid, 'native client differs from web client')
assert.equal(usableNativeIdToken(valid, 'us-east-2_other', now), undefined, 'wrong pool')
assert.equal(usableNativeIdToken(token({ ...claims, exp: now / 1000 }), pool, now), undefined, 'expired token')
assert.equal(usableNativeIdToken(token({ ...claims, exp: now / 1000 + 30 }), pool, now), undefined, 'expiry margin')
assert.equal(usableNativeIdToken(token({ ...claims, token_use: 'access' }), pool, now), undefined, 'access token')
assert.equal(usableNativeIdToken(token({ ...claims, aud: '' }), pool, now), undefined, 'missing audience')
assert.equal(usableNativeIdToken('malformed', pool, now), undefined, 'invalid JWT')
assert.equal(usableNativeIdToken(null, pool, now), undefined, 'no stored session')
console.log('8 native-session candidate checks passed; server signature verification is still required.')

// Exercise the actual store across fresh module instances (web reloads).
// Only Cognito/network transports are replaced; persistence and authUser run unchanged.
const storage = new Map()
globalThis.localStorage = {
  getItem: key => storage.get(key) ?? null,
  setItem: (key, value) => storage.set(key, value),
  removeItem: key => storage.delete(key)
}
globalThis.cookieTokens = []
globalThis.rejectCookie = false
const storeBundle = await build({
  entryPoints: ['src/store/auth.ts'], bundle: true, platform: 'node', format: 'esm', write: false, nodePaths: ['src'],
  define: { 'import.meta.env.VITE_COGNITO_USER_POOL_ID': JSON.stringify(pool), 'import.meta.env.VITE_COGNITO_USER_POOL_CLIENT_ID': '"web-client"' },
  plugins: [{ name: 'transport-fixtures', setup(build) {
    build.onResolve({ filter: /^(aws-amplify(\/auth)?|lib\/cookies|lib\/toast)$/ }, args => ({ path: args.path, namespace: 'fixture' }))
    build.onLoad({ filter: /.*/, namespace: 'fixture' }, args => ({ contents:
      args.path === 'aws-amplify' ? 'export const Amplify={configure(){}}' :
      args.path === 'aws-amplify/auth' ? 'export async function fetchAuthSession(){return {}}; export async function signOut(){}; export async function signIn(){}; export async function signUp(){}; export async function confirmSignUp(){}; export async function resetPassword(){};' :
      args.path === 'lib/cookies' ? 'export class CookieExchangeError extends Error{constructor(status){super("status "+status);this.status=status}};export async function getCookies(token){globalThis.cookieTokens.push(token);if(globalThis.cookieFailures&&globalThis.cookieFailures())throw new CookieExchangeError(globalThis.cookieStatus);if(globalThis.rejectCookie)throw new Error("server rejected token")}' :
      'export function notifySuccess(){};export function notifyError(){}'
    }))
  } }]
})
const storeURL = `data:text/javascript;base64,${Buffer.from(storeBundle.outputFiles[0].text).toString('base64')}`
const freshStore = async suffix => (await import(`${storeURL}#${suffix}`)).useAuthStore
const liveToken = token({ ...claims, exp: Math.floor(Date.now()/1000) + 3600 })
let store = await freshStore('first-open')
await store.getState().authUser(liveToken)
assert.equal(store.getState().currentUser.isAuthorized, true)
store = await freshStore('reload-other-layer')
await store.getState().authUser()
assert.equal(store.getState().currentUser.isAuthorized, true, 'native handoff restores without web-client login')
assert.equal(globalThis.cookieTokens.at(-1), liveToken, 'restored token revalidated by server')
await store.getState().signOut()
store = await freshStore('after-logout')
await store.getState().authUser()
assert.equal(store.getState().currentUser.isAuthorized, false, 'logout removes native handoff')
globalThis.rejectCookie = true
const originalError = console.error
console.error = () => {}
try { await store.getState().authUser(liveToken) } finally { console.error = originalError }
assert.equal(storage.has('sailtimer.nativeIdToken'), false, 'rejected token is never persisted')
assert.equal(store.getState().currentUser.isAuthorized, false)
console.log('Native handoff, reload, logout, and server-rejection lifecycle checks passed.')

// The app's user is known but the subscription record is still being written:
// keep retrying /sign-cookies, and never fall back to the web login page.
globalThis.rejectCookie = false
storage.clear()
let pendingFailures = 1
globalThis.cookieStatus = 403
const storeWithPending = await freshStore('purchase-race')
const originalWarn = console.warn
console.warn = () => {}
try {
  globalThis.cookieFailures = () => pendingFailures-- > 0
  await storeWithPending.getState().authUser(liveToken)
  assert.equal(storeWithPending.getState().currentUser.isAuthorized, true, 'retry succeeds once the record exists')
  assert.equal(storeWithPending.getState().currentUser.appSessionIssue, undefined)

  globalThis.cookieFailures = () => true
  storage.clear()
  const neverRecorded = await freshStore('never-recorded')
  await neverRecorded.getState().authUser(liveToken)
  assert.equal(neverRecorded.getState().currentUser.isAuthorized, false)
  assert.equal(neverRecorded.getState().currentUser.appSessionIssue, 'activation', 'shows activation message, not login')
  assert.equal(neverRecorded.getState().currentUser.appSessionToken, liveToken, 'keeps token for retry')
  assert.equal(storage.has('sailtimer.nativeIdToken'), false)
} finally {
  console.warn = originalWarn
  globalThis.cookieFailures = undefined
}
console.log('Subscription-record retry and activation-pending checks passed.')

// Server errors and network failures must also keep app users off the login page.
for (const [status, label] of [[500, 'HTTP 500'], [0, 'network failure']]) {
  storage.clear()
  globalThis.cookieStatus = status
  let failures = 1
  globalThis.cookieFailures = () => failures-- > 0
  const warn = console.warn
  console.warn = () => {}
  try {
    const recovers = await freshStore(`transient-${status}`)
    await recovers.getState().authUser(liveToken)
    assert.equal(recovers.getState().currentUser.isAuthorized, true, `${label} is retried`)

    globalThis.cookieFailures = () => true
    storage.clear()
    const down = await freshStore(`down-${status}`)
    await down.getState().authUser(liveToken)
    assert.equal(down.getState().currentUser.isAuthorized, false)
    assert.equal(down.getState().currentUser.appSessionIssue, 'unavailable', `${label} shows retry notice, not login`)

    globalThis.cookieFailures = () => false
    await down.getState().authUser(down.getState().currentUser.appSessionToken)
    assert.equal(down.getState().currentUser.isAuthorized, true, `${label}: Try again recovers`)
  } finally {
    console.warn = warn
    globalThis.cookieFailures = undefined
  }
}
console.log('HTTP 500, network failure and Try-again recovery checks passed.')
