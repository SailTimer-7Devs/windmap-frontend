import type { ElementType, ReactElement } from 'react'
import type { FieldValues, Path } from 'react-hook-form'

import { Controller } from 'react-hook-form'

function FormField<T extends FieldValues>(props: FormFieldProps<T>): ReactElement {
  const {
    component: Component,
    name,
    ...restProps
  } = props

  return (
    <Controller
      name={name}
      render={({ field }) => {
        return (
          <Component
            value={field.value}
            onChange={field.onChange}
            name={field.name}
            {...restProps}
          />
        )
      }}
    />
  )
}

interface FormFieldProps<T extends FieldValues> {
  component: ElementType
  name: Path<T>

  [key: string]: unknown
}

export default FormField
