import type { ReactElement } from 'react'
import type { TextureData } from 'weatherlayers-gl-fork/client'

import { WIND_LAYER_KEYS } from 'constants/layer/wind'
import { WH_LAYER_KEYS } from 'constants/layer/wh'

export type MapViewState = {
  longitude: number
  latitude: number
  zoom: number
  minZoom: number
  maxZoom: number
}

export type LayerKey = typeof WIND_LAYER_KEYS.WIND
  | typeof WIND_LAYER_KEYS.WIND_HEATMAP
  | typeof WIND_LAYER_KEYS.WIND_DIRECTION_HEATMAP
  | typeof WIND_LAYER_KEYS.WIND_BARBS
  | typeof WH_LAYER_KEYS.WH
  | typeof WH_LAYER_KEYS.WH_HEATMAP

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
    icon: ReactElement
    onClick: () => void
  }[]
}