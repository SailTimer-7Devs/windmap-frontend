import type { Dispatch, SetStateAction } from 'react'

import React from 'react'

import {
  WIND_HEATMAP,
  WIND_DIRECTION_HEATMAP
} from 'constants/layer/wind'
import { WEATHER_WNI_PSWH_HEATMAP, WEATHER_WNI_PSWH_UV } from 'constants/layer/weather_wni'

import { WEATHER_WNI_LAYER_KEYS } from 'constants/layer/weather_wni'

const WEATHER_WNI_LAYER_LIST = Object.values(WEATHER_WNI_LAYER_KEYS)

const PSWH_GROUP = [WEATHER_WNI_PSWH_HEATMAP, WEATHER_WNI_PSWH_UV]

const EXCLUSIVE_GROUPS = [
  [WIND_HEATMAP, WIND_DIRECTION_HEATMAP],
  WEATHER_WNI_LAYER_LIST
]

const applyExclusiveLayers = (list: string[], item: string): string[] => {
  if (PSWH_GROUP.includes(item)) {
    const hasCommon = list.some(item => PSWH_GROUP.includes(item))
    return list.includes(item)
      ? list.filter(i => i !== item)
      : hasCommon
        ? [...list, item]
        : [item]
  }

  for (const group of EXCLUSIVE_GROUPS) {
    if (group.includes(item)) {
      return [...list.filter(i => !group.includes(i)), item]
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

  console.log({ value })

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
    console.log('add', item)
    setValue(prev => {
      if (!prev.list.includes(item)) {
        return { ...prev, list: [...prev.list, item] }
      }
      return prev
    })
  }

  const remove = (item: string) => {
    console.log('remove', item)
    setValue(prev => ({
      ...prev,
      list: prev.list.filter(i => i !== item)
    }))
  }

  const toggle = (item: string) => {
    console.log('toggle', item)
    setValue(prev => {
      const isActive = prev.list.includes(item)
      console.log({ isActive, prev })
      if (isActive) {
        /* Standard toggle behavior for items */
        return {
          ...prev,
          list: prev.list.filter(i => i !== item)
        }
      } else {
        /* Logic for mutually exclusion layers */
        const newList = applyExclusiveLayers(prev.list, item)
        console.log({ newList })
        if (!newList.includes(item)) {
          console.log('newListnotIncludes')
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
