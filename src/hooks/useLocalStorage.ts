import React from 'react'

type UseLocalStorageReturn<T> = {
  value: T;
  setValue: React.Dispatch<React.SetStateAction<T>>;
  add: (item: string) => void;
  remove: (item: string) => void;
  toggle: (item: string) => void;
};

export function useLocalStorage<T>(key: string, initialValue?: T): UseLocalStorageReturn<T> {
  const [value, setValue] = React.useState<T>(() => {
    if (typeof window === 'undefined') return initialValue
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
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
    if (Array.isArray(value) && !value.includes(item)) {
      setValue([...value, item] as T)
    }
  }

  const remove = (item: string) => {
    if (Array.isArray(value)) {
      setValue(value.filter((i) => i !== item) as T)
    }
  }

  const toggle = (item: string) => {
    if (Array.isArray(value)) {
      if (value.includes(item)) {
        remove(item)
      } else {
        add(item)
      }
    }
  }

  return { value, setValue, add, remove, toggle } as const
}