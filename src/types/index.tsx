import type { Dispatch, ReactElement, SetStateAction } from 'react'
import type { TextureData } from 'weatherlayers-gl-fork/client'

import { LAYER_KEYS } from 'src/constants/layers'

export type MapViewState = {
  longitude: number
  latitude: number
  zoom: number
  minZoom: number
  maxZoom: number
}

export type LayerKey = typeof LAYER_KEYS.WIND
  | typeof LAYER_KEYS.WIND_HEATMAP
  | typeof LAYER_KEYS.WIND_DIRECTION_HEATMAP
  | typeof LAYER_KEYS.WIND_BARBS

export type LayersState = {
  [key in LayerKey]: {
    data?: TextureData
    visible: boolean
  }
}

export type LayersMenuProps = {
  state: LayersState
  setState: Dispatch<SetStateAction<LayersState>>
}

export type DropdownMenuProps = {
  caption: string
  options: {
    label: string
    icon: ReactElement
    onClick: () => void
  }[]
}