import { jwtDecode } from 'jwt-decode'

export const NATIVE_ID_TOKEN_KEY = 'sailtimer.nativeIdToken'

// This is only a candidate for /sign-cookies, which verifies the signature
// and entitlement. Native refresh tokens remain in the iOS Keychain.
export function usableNativeIdToken(token: string | null, userPoolId: string, now = Date.now()): string | undefined {
  if (!token) return undefined
  try {
    const claims = jwtDecode<{ iss?: string; aud?: string; exp?: number; token_use?: string }>(token)
    const region = userPoolId.split('_')[0]
    if (claims.iss !== `https://cognito-idp.${region}.amazonaws.com/${userPoolId}` ||
        !claims.aud || claims.token_use !== 'id' ||
        !claims.exp || claims.exp * 1000 <= now + 30000) return undefined
    return token
  } catch {
    return undefined
  }
}
