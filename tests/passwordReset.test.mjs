import assert from 'node:assert/strict'
import { build } from 'esbuild'

const requests = []
const notifications = []
let failure = null
globalThis.passwordResetFixture = { requests, notifications, get failure() { return failure } }

const result = await build({
  entryPoints: ['src/store/auth.ts'], bundle: true, platform: 'node', format: 'esm', write: false, nodePaths: ['src'],
  define: {
    'import.meta.env.VITE_COGNITO_USER_POOL_ID': '"us-east-2_test"',
    'import.meta.env.VITE_COGNITO_USER_POOL_CLIENT_ID': '"web-client"'
  },
  plugins: [{ name: 'auth-fixtures', setup(build) {
    build.onResolve({ filter: /^(aws-amplify(\/auth)?|lib\/cookies|lib\/toast)$/ }, args => ({ path: args.path, namespace: 'fixture' }))
    build.onLoad({ filter: /.*/, namespace: 'fixture' }, args => ({ contents:
      args.path === 'aws-amplify' ? 'export const Amplify={configure(){}}' :
      args.path === 'aws-amplify/auth' ? `
        export async function resetPassword(input) { globalThis.passwordResetFixture.requests.push(['start', input]); if(globalThis.passwordResetFixture.failure) throw globalThis.passwordResetFixture.failure }
        export async function confirmResetPassword(input) { globalThis.passwordResetFixture.requests.push(['confirm', input]); if(globalThis.passwordResetFixture.failure) throw globalThis.passwordResetFixture.failure }
        export async function fetchAuthSession(){return {}}; export async function signOut(){}; export async function signIn(){}; export async function signUp(){}; export async function confirmSignUp(){};
      ` :
      args.path === 'lib/cookies' ? 'export class CookieExchangeError extends Error{}; export async function getCookies(){}' :
      'export function notifySuccess(message){globalThis.passwordResetFixture.notifications.push(["success",message])}; export function notifyError(message){globalThis.passwordResetFixture.notifications.push(["error",message])}'
    }))
  } }]
})

const { useAuthStore } = await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`)
await useAuthStore.getState().resetPassword({ email: '  Test@Example.com  ' })
assert.deepEqual(requests.at(-1), ['start', { username: 'Test@Example.com' }])
assert.equal(notifications.at(-1)[0], 'success')

await useAuthStore.getState().confirmResetPassword({ email: ' Test@Example.com ', confirmationCode: ' 123456 ', password: 'new-password', confirmPassword: 'new-password' })
assert.deepEqual(requests.at(-1), ['confirm', { username: 'Test@Example.com', confirmationCode: '123456', newPassword: 'new-password' }])
assert.equal(notifications.at(-1)[0], 'success')

failure = new Error('Cognito rejected request')
const originalError = console.error
console.error = () => {}
try {
  await assert.rejects(useAuthStore.getState().resetPassword({ email: 'Test@Example.com' }), failure)
  assert.equal(notifications.at(-1)[0], 'error')
  await assert.rejects(useAuthStore.getState().confirmResetPassword({ email: 'Test@Example.com', confirmationCode: '123456', password: 'new-password', confirmPassword: 'new-password' }), failure)
  assert.equal(notifications.at(-1)[0], 'error')
} finally {
  console.error = originalError
}
console.log('Password reset start, confirmation, and failure propagation checks passed.')
