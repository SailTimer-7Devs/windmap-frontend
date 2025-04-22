import type { Layer } from 'deck.gl'
import type { LayerMenuProps } from 'types'

import React from 'react'

import * as pswdLayer from 'constants/layer/pswd'
import * as windLayer from 'constants/layer/wind'

export default function useLayerData(
  name: string
): {
  layerList: Layer[]
  layerMenu: LayerMenuProps[]
  layerLoading: boolean
} {
  const [layerList, setLayerList] = React.useState<Layer[]>([])
  const [layerMenu, setLayerMenu] = React.useState<LayerMenuProps[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    let isCancelled = false
    setIsLoading(true)

    async function loadData() {
      try {
        switch (name) {
          case windLayer.WIND: {
            const windLayersState = await windLayer.getWindLayersData()

            if (!isCancelled) {
              setLayerList(windLayer.getWindLayers(windLayersState))
              setLayerMenu(windLayer.WIND_LAYERS_MENU_LIST)
              setIsLoading(false)
            }
            break
          }

          case pswdLayer.PSWD_HEATMAP: {
            const pswdLayersState = await pswdLayer.getPswdLayersData()

            if (!isCancelled) {
              setLayerList(pswdLayer.getPswdLayers(pswdLayersState))
              setLayerMenu(pswdLayer.PSWD_LAYERS_MENU_LIST)
              setIsLoading(false)
            }
            break
          }

          default: {
            const windLayersState = await windLayer.getWindLayersData()

            if (!isCancelled) {
              setLayerList(windLayer.getWindLayers(windLayersState))
              setLayerMenu(windLayer.WIND_LAYERS_MENU_LIST)
              setIsLoading(false)
            }
            break
          }
        }
      } catch (error) {
        console.error(error)
        if (!isCancelled) {
          setIsLoading(false)
        }
      }
    }

    loadData()

    return () => {
      isCancelled = true
    }

  }, [name])

  return {
    layerList,
    layerMenu,
    layerLoading: isLoading
  }
}