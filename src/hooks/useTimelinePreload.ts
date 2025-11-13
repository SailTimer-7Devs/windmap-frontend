import type { LayersState } from 'types'

import React from 'react'

import { preloadLayersData } from 'lib/layers'

interface UseTimelinePreloadReturn {
  getTimelinePreload: (requestedDatetimes: string[]) => Promise<void>[]
}

export default function useTimelinePreload(
  layerName: string,
  datetimes: string[]
): UseTimelinePreloadReturn {
  const [cache, setCache] = React.useState<Map<number, LayersState>>(
    () => new globalThis.Map()
  )
  console.log({ cache })

  const getTimelinePreload = (requestedDatetimes: string[]) => {
    const promises: Promise<void>[] = requestedDatetimes.map((datetime) => {
      const timelineIndex = datetimes.findIndex((dt) => dt === datetime)

      if (cache.has(timelineIndex)) {
        return Promise.resolve()
      }

      if (!navigator.onLine) {
        console.warn('Offline mode detected.')
  
        if (cache.size === 0) {
          alert('Sorry, that data is not available while you are offline.')
          return Promise.reject()
        }
      }

      return preloadLayersData(layerName, timelineIndex).then((data) => {
        setCache((prev) => {
          const updated = new globalThis.Map(prev)
          updated.set(timelineIndex, data)
          return updated
        })
      })
    })

    return promises
  }

  return { getTimelinePreload } as const
} 
