import type { Layer } from 'deck.gl'
import type { LayerMenuProps } from 'types'

import React from 'react'

import { getLayersConfig } from 'lib/layers'

interface LayerState {
  layerList: Layer[]
  layerMenu: LayerMenuProps[]
}

export default function useLayerData(
  name: string,
  timelineIndex: number = 0
): LayerState {
  const [layerState, setLayerState] = React.useState<LayerState>({
    layerList: [],
    layerMenu: []
  })

  React.useEffect(() => {
    let isCancelled = false

    async function loadData() {
      try {
        const config = getLayersConfig(name)

        if (isCancelled) return

        const layersState = await config.getDataFn(timelineIndex)

        if (!isCancelled) {
          setLayerState({
            layerList: config.getLayersFn(layersState),
            layerMenu: config.module.LAYERS_MENU_LIST
          })
        }
      } catch (error) {
        console.error(error)
      }
    }

    loadData()

    return () => {
      isCancelled = true
    }

  }, [name, timelineIndex])

  return {
    layerList: layerState.layerList,
    layerMenu: layerState.layerMenu
  }
}
