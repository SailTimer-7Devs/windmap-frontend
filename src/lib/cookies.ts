const API_URL = import.meta.env.VITE_API_URL

if (!API_URL) {
  throw new Error('Missing env variables: API_URL')
}

export async function getCookies(accessToken: string): Promise<void> {
  if (!accessToken) {
    console.warn('Access token not provided')
    return
  }

  try {
    const response = await fetch(API_URL, {
      method: 'POST', /* or 'GET' */
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      credentials: 'include'
    })

    if (!response.ok) {
      throw new Error(`Failed to get cookies: ${response.status}`)
    }

  } catch (err) {
    console.error(err)
  }
}