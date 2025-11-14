import { useState } from 'react'
import type { MouseEvent as ReactMouseEvent } from 'react'

type SetterArg<T> = ReactMouseEvent<HTMLElement> | T | null
type UseCurrentTargetReturn<T> = readonly [
  T | null,
  (value: SetterArg<T>) => void,
  () => void
]

export default function useCurrentTarget<T = HTMLElement>(
  defaultValue: T | null = null
): UseCurrentTargetReturn<T> {
  const [currentTarget, setCurrentTarget] = useState<T | null>(defaultValue)

  const set = (value: SetterArg<T>) => {
    if (value && typeof (value as ReactMouseEvent<HTMLElement>).currentTarget !== 'undefined') {
      setCurrentTarget((value as ReactMouseEvent<HTMLElement>).currentTarget as T)
      return
    }

    setCurrentTarget(value as T | null)
  }

  const reset = () => {
    setCurrentTarget(defaultValue)
  }

  return [currentTarget, set, reset]
}
