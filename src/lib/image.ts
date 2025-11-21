import type { TextureData } from 'weatherlayers-gl/client'

const CREDENTIALS = import.meta.env.VITE_STAGE === 'dev' ? 'same-origin' : 'include'

export async function handleImageDataLoad(url: string): Promise<TextureData> {
  const response = await fetch(url, {
    credentials: CREDENTIALS
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`)
  }

  const blob = await response.blob()
  const objectUrl = URL.createObjectURL(blob)

  return new Promise((resolve, reject) => {
    const img = new Image()

    img.onload = () => {
      URL.revokeObjectURL(objectUrl)

      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height

      const ctx = canvas.getContext('2d')
      ctx!.drawImage(img, 0, 0)

      const { data } = ctx!.getImageData(0, 0, canvas.width, canvas.height)

      resolve({
        data,
        width: canvas.width,
        height: canvas.height
      })
    }

    img.onerror = (error) => {
      URL.revokeObjectURL(objectUrl)
      reject(error)
    }

    img.src = objectUrl
  })
}
