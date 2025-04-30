import { STORAGE_LAYER_KEY } from 'constants/localStorage'
import { WIND } from 'constants/layer/wind'

export default function getUrlParams(
  key = STORAGE_LAYER_KEY,
  defaultValue = WIND
): string {
  const url = window.location.href
  const params = new URL(url).searchParams
  const value = params.get(key) || defaultValue

  return value
}
