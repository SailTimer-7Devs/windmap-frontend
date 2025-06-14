import type { ReactElement } from 'react'
import type { TextureData } from 'weatherlayers-gl/client'

import { PSWH_LAYER_KEYS } from 'constants/layer/pswh'
import { PWH_LAYER_KEYS } from 'constants/layer/pwh'
import { WIND_LAYER_KEYS } from 'constants/layer/wind'
import { WSH_LAYER_KEYS } from 'constants/layer/wsh'

export type MapViewState = {
  longitude: number
  latitude: number
  zoom: number
  minZoom: number
  maxZoom: number
}

export type LayerKey =
  /* WIND */
  typeof WIND_LAYER_KEYS.WIND
  | typeof WIND_LAYER_KEYS.WIND_HEATMAP
  | typeof WIND_LAYER_KEYS.WIND_DIRECTION_HEATMAP
  | typeof WIND_LAYER_KEYS.WIND_BARBS

  /* WNI_PSWH */
  | typeof PSWH_LAYER_KEYS.PSWH_HEATMAP
  | typeof PSWH_LAYER_KEYS.PSWH_UV

  /* WNI_PWH */
  | typeof PWH_LAYER_KEYS.PWH_HEATMAP
  | typeof PWH_LAYER_KEYS.PWH_UV

  /* WNI_WSH */
  | typeof WSH_LAYER_KEYS.WSH_HEATMAP
  | typeof WSH_LAYER_KEYS.WSH_UV

export type LayersState = {
  [key in LayerKey]: TextureData | undefined
}

export type LayerMenuProps = {
  id: string
  name: string
}

export type LayersMenuProps = {
  layersId: LayerKey[]
  toggle: (layerId: LayerKey) => void
  menuList: {
    id: LayerKey
    name: string
  }[]
}

export type DropdownMenuProps = {
  caption: string
  options: {
    label: string
    icon?: ReactElement
    onClick?: () => void
    href?: string
  }[]
}