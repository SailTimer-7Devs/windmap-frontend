import type { Layer } from 'deck.gl'
import type { LayerMenuProps } from 'types'

import React from 'react'

import * as pswhLayer from 'constants/layer/pswh'
import * as pwhLayer from 'constants/layer/pwh'
import * as windLayer from 'constants/layer/wind'
import * as wshLayer from 'constants/layer/wsh'

interface LayerState {
  layerList: Layer[]
  layerMenu: LayerMenuProps[]
  isLoading: boolean
}

interface LayerModule {
  LAYERS_MENU_LIST: LayerMenuProps[]
}

type UseLayerDataReturnProps = {
  layerList: Layer[]
  layerMenu: LayerMenuProps[]
  layerLoading: boolean
}

export default function useLayerData(
  name: string
): UseLayerDataReturnProps {
  const [layerState, setLayerState] = React.useState<LayerState>({
    layerList: [],
    layerMenu: [],
    isLoading: true
  })

  React.useEffect(() => {
    let isCancelled = false

    /* start loading */
    setLayerState(prev => ({
      ...prev,
      isLoading: true
    }))

    async function setLayerData<T>(
      layerModule: LayerModule,
      getDataFn: () => Promise<T>,
      getLayersFn: (state: T) => Layer[]
    ) {
      if (isCancelled) return

      const layersState = await getDataFn()

      if (!isCancelled) {
        setLayerState({
          layerList: getLayersFn(layersState),
          layerMenu: layerModule.LAYERS_MENU_LIST,
          isLoading: false
        })
      }
    }

    async function loadData() {
      try {
        switch (name) {
          case windLayer.WIND: {
            await setLayerData(
              windLayer as LayerModule,
              windLayer.getWindLayersData,
              windLayer.getWindLayers
            )
            break
          }

          case pswhLayer.PSWH_HEATMAP: {
            await setLayerData(
              pswhLayer as LayerModule,
              pswhLayer.getPswhLayersData,
              pswhLayer.getPswhLayers
            )
            break
          }

          case pwhLayer.PWH_HEATMAP: {
            await setLayerData(
              pwhLayer as LayerModule,
              pwhLayer.getPwhLayersData,
              pwhLayer.getPwhLayers
            )
            break
          }

          case wshLayer.WSH_HEATMAP: {
            await setLayerData(
              wshLayer as LayerModule,
              wshLayer.getWshLayersData,
              wshLayer.getWshLayers
            )
            break
          }

          default: {
            await setLayerData(
              windLayer as LayerModule,
              windLayer.getWindLayersData,
              windLayer.getWindLayers
            )
            break
          }
        }
      } catch (error) {
        console.error(error)

        /* end loading */
        if (!isCancelled) {
          setLayerState(prev => ({
            ...prev,
            isLoading: false
          }))
        }
      }
    }

    loadData()

    return () => {
      isCancelled = true
    }

  }, [name])

  return {
    layerList: layerState.layerList,
    layerMenu: layerState.layerMenu,
    layerLoading: layerState.isLoading
  }
}