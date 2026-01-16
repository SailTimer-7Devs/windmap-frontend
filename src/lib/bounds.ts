const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max)

export const clampLat = (lat: number): number =>
  clamp(lat, -90, 90)

export const clampLng = (lng: number): number =>
  clamp(lng, -180, 180)
