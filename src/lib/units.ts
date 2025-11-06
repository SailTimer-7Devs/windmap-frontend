import { WEATHER_WNI_LAYER_KEYS } from 'constants/layer/weather_wni'
import { WIND_LAYER_KEYS } from 'constants/layer/wind'

export const convertMetersPerSecondsToKnots = (value: number): number => value * 1.94384449 // 1 m/s ≈ 1.94384449 
export const convertKelvinToCelsius = (value: number): number => value - 273.15

export function getUnitFormat(layerId: string | undefined): string {
  switch (layerId) {
    case WEATHER_WNI_LAYER_KEYS.WEATHER_WNI_WAVE_TOOLTIP:
    case WEATHER_WNI_LAYER_KEYS.WEATHER_WNI_UUU_TOOLTIP:
      return 'm/s'
    case WEATHER_WNI_LAYER_KEYS.WEATHER_WNI_WIND_TOOLTIP:
    case WIND_LAYER_KEYS.WIND_TOOLTIP:
      return 'knots'
    case WEATHER_WNI_LAYER_KEYS.WEATHER_WNI_TMP1000HPA:
    case WEATHER_WNI_LAYER_KEYS.WEATHER_WNI_SST:
      return '°C'
    case WEATHER_WNI_LAYER_KEYS.WEATHER_WNI_PSWH_HEATMAP:
    case WEATHER_WNI_LAYER_KEYS.WEATHER_WNI_VISIBILITY:
      return 'm'
    case WEATHER_WNI_LAYER_KEYS.WEATHER_WNI_PSWH_UV_TOOLTIP:
      return '°'
    case WEATHER_WNI_LAYER_KEYS.WEATHER_WNI_INTPCP:
      return 'kg/m²'
    default:
      return ''
  }
}
