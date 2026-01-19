import type { Dispatch, SetStateAction } from 'react'

import React from 'react'

import {
  WIND_HEATMAP,
  WIND_DIRECTION_HEATMAP,
  WIND_CROWDSOURCED_UV,
  WIND,
  WIND_TOOLTIP
} from 'constants/layer/wind'
import {
  WEATHER_WNI_SIGWH_HEATMAP,
  WEATHER_WNI_SIGWH_UV,
  WEATHER_WNI_OCEAN_CURRENT_UV,
  WEATHER_WNI_OCEAN_CURRENT_HEATMAP,
  WEATHER_WNI_WIND_HEATMAP,
  WEATHER_WNI_WIND_UV
} from 'constants/layer/weather_wni'

import {
  WEATHER_WNI_LAYER_KEYS
} from 'constants/layer/weather_wni'

const WEATHER_WNI_LAYER_LIST = Object.values(WEATHER_WNI_LAYER_KEYS)

const WEATHER_WNI_SIGWH_GROUP = [WEATHER_WNI_SIGWH_HEATMAP, WEATHER_WNI_SIGWH_UV]
const WEATHER_WNI_OCEAN_GROUP = [
  WEATHER_WNI_OCEAN_CURRENT_UV,
  WEATHER_WNI_OCEAN_CURRENT_HEATMAP
]
const WEATHER_WNI_WIND_GROUP = [WEATHER_WNI_WIND_HEATMAP, WEATHER_WNI_WIND_UV]

const EXCLUSIVE_GROUPS = [
  [WIND_HEATMAP, WIND_DIRECTION_HEATMAP],
  WEATHER_WNI_LAYER_LIST
]

const WIND_LAYER_GROUP = [WIND, WIND_CROWDSOURCED_UV]

const MULTIPLE_GROUPS = [
  WEATHER_WNI_SIGWH_GROUP,
  WEATHER_WNI_OCEAN_GROUP,
  WEATHER_WNI_WIND_GROUP,
  WIND_LAYER_GROUP
]

const applyExclusiveLayers = (list: string[], item: string): string[] => {
  for (const group of MULTIPLE_GROUPS) {
    if (group.includes(item)) {
      return WIND_LAYER_GROUP.includes(item)
        ? [...new Set([...list, ...group, WIND_TOOLTIP])]
        : group
    }
  }

  for (const group of EXCLUSIVE_GROUPS) {
    if (group.includes(item)) {
      const newList = [...list.filter(i => !group.includes(i)), item]
      return newList
    }
  }

  return list
}

type UseLocalStorageProps<T> = {
  value: T
  setValue: Dispatch<SetStateAction<T>>
  add: (item: string) => void
  remove: (item: string) => void
  toggle: (item: string) => void
  reset: (newValue: Partial<T> & { name: string }) => void
};

function useLocalStorageLayer<T extends { name: string, list: string[] }>(
  key: string,
  initialValue: T
): UseLocalStorageProps<T> {
  const [value, setValue] = React.useState<T>(() => {
    if (typeof window === 'undefined') return initialValue

    try {
      const item = window.localStorage.getItem(key)

      if (item) {
        const storedValue = JSON.parse(item)

        if (storedValue.name !== initialValue.name) {
          return {
            ...storedValue,
            name: initialValue.name,
            list: initialValue.list
          }
        }

        return storedValue
      }

      return initialValue
    } catch (error) {
      console.error('Error loading from localStorage: ', error)

      return initialValue
    }
  })

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(key, JSON.stringify(value))
      } catch (error) {
        console.error('Error saving to localStorage: ', error)
      }
    }
  }, [key, value])

  const add = (item: string) => {
    setValue(prev => {
      if (!prev.list.includes(item)) {
        return { ...prev, list: [...prev.list, item] }
      }
      return prev
    })
  }

  const remove = (item: string) => {
    setValue(prev => ({
      ...prev,
      list: prev.list.filter(i => i !== item)
    }))
  }

  const toggle = (item: string) => {
    setValue(prev => {
      const isActive = prev.list.includes(item)
      if (isActive) {
        return WIND_LAYER_GROUP.includes(item)
          ? {
            ...prev,
            list: prev.list.filter(x => !WIND_LAYER_GROUP.includes(x))
          }
          : {
            ...prev,
            list: prev.list.filter(i => i !== item)
            /* Standard toggle behavior for items */
          }
      } else {
        /* Logic for mutually exclusion layers */
        const newList = applyExclusiveLayers(prev.list, item)
        if (!newList.includes(item)) {
          return {
            ...prev,
            list: [...prev.list, item]
          }
        }

        return {
          ...prev,
          list: newList
        }
      }
    })
  }

  const reset = (newPartialValue: Partial<T> & { name: string }) => {
    setValue(prev => ({
      ...prev,
      ...newPartialValue
    }) as T)
  }

  return {
    value,
    setValue,
    add,
    remove,
    toggle,
    reset
  } as const
}

export default useLocalStorageLayer
