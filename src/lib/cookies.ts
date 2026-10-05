const API_URL = import.meta.env.VITE_API_URL

if (!API_URL) {
  throw new Error('Missing env variables: API_URL')
}

// A stalled request must not keep the map on its loading spinner indefinitely.
const SIGN_COOKIES_TIMEOUT_MS = 10000

export class CookieExchangeError extends Error {
  // HTTP status, or 0 when the request failed or timed out before a response.
  readonly status: number

  constructor(status: number) {
    super(`Unable to establish the subscription session (${status || 'network error'})`)
    this.name = 'CookieExchangeError'
    this.status = status
  }
}

export async function getCookies(
  idToken: string,
  timeoutMs: number = SIGN_COOKIES_TIMEOUT_MS
): Promise<void> {
  if (import.meta.env.VITE_STAGE === 'dev') {
    return Promise.resolve()
  }

  if (!idToken) {
    throw new Error('ID token was not provided')
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), Math.min(timeoutMs, SIGN_COOKIES_TIMEOUT_MS))
  let response: Response
  try {
    response = await fetch(`${API_URL}/sign-cookies`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${idToken}`
      },
      credentials: 'include',
      signal: controller.signal
    })
  } catch {
    throw new CookieExchangeError(0)
  } finally {
    clearTimeout(timer)
  }

  if (!response.ok) {
    throw new CookieExchangeError(response.status)
  }
}
