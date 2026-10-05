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
      args.path === 'lib/cookies' ? 'export async function getCookies(token){globalThis.cookieTokens.push(token);if(globalThis.rejectCookie)throw new Error("server rejected token")}' :
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
