import type { TextureData } from 'weatherlayers-gl-fork/client'

export function handleImageDataLoad(url: string): Promise<TextureData> {
  return new Promise((resolve, reject) => {
    const img = new Image()

    img.crossOrigin = 'anonymous'

    img.onload = () => {
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

    img.onerror = reject

    img.src = url
  })
}
