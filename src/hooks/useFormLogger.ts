import type { FieldValues, UseFormReturn } from 'react-hook-form'

import React from 'react'
import _isEqual from 'lodash/isEqual'

import { isDevMode } from 'bootstrap'

interface UseFormLoggerOptions {
  enabled?: boolean
  formName?: string
}

function useFormLogger<T extends FieldValues = FieldValues>(
  form: UseFormReturn<T>,
  options: UseFormLoggerOptions = {}
): void {
  const {
    enabled = isDevMode,
    formName
  } = options

  const previousValues = React.useRef(form.getValues())

  React.useEffect(() => {
    if (!enabled || !formName) return

    const fields = form.getValues() || {}

    const initialValues = Object.fromEntries(
      Object.entries(fields)
        .filter(([, value]) => value !== undefined)
    )

    const subscription = form.watch((values, { name: fieldName, type }) => {
      const currentValues = values || {}

      if (!_isEqual(previousValues.current, currentValues)) {
        console.info(
          `changed field: %c${fieldName}`,
          'color: #ffa500; font-weight: bold;',
          {
            formName,
            initialValues,
            fields: currentValues,
            eventType: type
          }
        )

        previousValues.current = currentValues as T
      }
    })

    return () => subscription.unsubscribe()
  }, [enabled, form, formName])
}

export default useFormLogger