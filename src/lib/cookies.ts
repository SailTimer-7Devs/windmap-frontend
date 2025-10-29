const API_URL = import.meta.env.VITE_API_URL

if (!API_URL) {
  throw new Error('Missing env variables: API_URL')
}

export async function getCookies(idToken: string): Promise<void> {
  if (!idToken) {
    console.warn('ID token not provided')
    return
  }

  try {
    const response = await fetch(`${API_URL}/sign-cookies`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${idToken}`
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to get cookies: ${response.status}`)
    }

  } catch (err) {
    console.error(err)
  }
}
