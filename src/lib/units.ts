import { WEATHER_WNI_LAYER_KEYS } from 'constants/layer/weather_wni'
import { WIND_LAYER_KEYS } from 'constants/layer/wind'

export const convertMetersPerSecondsToKnots = (value: number): number => value * 1.94384449 // 1 m/s ≈ 1.94384449 

export function getUnitFormat(layerId: string | undefined): string {
  switch (layerId) {
    case WEATHER_WNI_LAYER_KEYS.WEATHER_WNI_WIND_TOOLTIP:
    case WEATHER_WNI_LAYER_KEYS.WEATHER_WNI_WAVE_TOOLTIP:
      return 'm/s'
    case WIND_LAYER_KEYS.WIND_TOOLTIP:
      return 'knots'
    default:
      return 'meters'
  }
}
