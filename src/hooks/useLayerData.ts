import type { Layer } from 'deck.gl'
import type { LayerMenuProps } from 'types'

import React from 'react'

import * as pswdLayer from 'constants/layer/pswh'
import * as pwhLayer from 'constants/layer/pwh'
import * as windLayer from 'constants/layer/wind'
import * as wshLayer from 'constants/layer/wsh'

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

          case pswdLayer.PSWH_HEATMAP: {
            const pswdLayersState = await pswdLayer.getPswdLayersData()

            if (!isCancelled) {
              setLayerList(pswdLayer.getPswdLayers(pswdLayersState))
              setLayerMenu(pswdLayer.PSWH_LAYERS_MENU_LIST)
              setIsLoading(false)
            }
            break
          }

          case pwhLayer.PWH_HEATMAP: {
            const pwhLayersState = await pwhLayer.getPwhLayersData()

            if (!isCancelled) {
              setLayerList(pwhLayer.getPwhLayers(pwhLayersState))
              setLayerMenu(pwhLayer.PWH_LAYERS_MENU_LIST)
              setIsLoading(false)
            }
            break
          }

          case wshLayer.WSH_HEATMAP: {
            const wshLayersState = await wshLayer.getPwhLayersData()

            if (!isCancelled) {
              setLayerList(wshLayer.getPwhLayers(wshLayersState))
              setLayerMenu(wshLayer.WSH_LAYERS_MENU_LIST)
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