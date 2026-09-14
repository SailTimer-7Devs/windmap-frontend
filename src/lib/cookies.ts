const API_URL = import.meta.env.VITE_API_URL

if (!API_URL) {
  throw new Error('Missing env variables: API_URL')
}

export async function getCookies(idToken: string): Promise<void> {
  if (import.meta.env.VITE_STAGE === 'dev') {
    return Promise.resolve()
  }

  if (!idToken) {
    throw new Error('ID token was not provided')
  }

  const response = await fetch(`${API_URL}/sign-cookies`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${idToken}`
    },
    credentials: 'include'
  })

  if (!response.ok) {
    throw new Error(`Unable to establish the subscription session (${response.status})`)
  }
}
