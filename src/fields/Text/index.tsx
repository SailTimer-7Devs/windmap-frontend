import type { ForwardedRef, ReactElement, ReactNode } from 'react'
import type { FieldValues, Path } from 'react-hook-form'

import React from 'react'
import { clsx as cx } from 'clsx'

import {
  Description,
  Field,
  Input,
  Label
} from '@headlessui/react'

import useFormContext from 'hooks/useFormContext'
import useFormState from 'hooks/useFormState'

type TextFieldProps<T extends FieldValues> = {
  label?: string
  name: Path<T>
  placeholder?: string
  type?: string
  disabled?: boolean
  helperText?: string
  className?: string
  children?: ReactNode | ((props: { isError: boolean }) => ReactNode)
}

function TextField<T extends FieldValues>(
  props: TextFieldProps<T>,
  ref: ForwardedRef<HTMLInputElement>
): ReactElement {
  const {
    label,
    name,
    placeholder,
    type = 'text',
    disabled,
    helperText,
    className,
    children,
    ...rest
  } = props

  const { control } = useFormContext()

  const { errors } = useFormState({
    name,
    control,
    exact: true
  })
  const isError = Boolean(errors[name])

  return (
    <Field className='relative pb-5 text-gray-500'>
      {label && (
        <Label
          htmlFor={name}
          className={cx(
            'block mb-1 text-sm',
            isError ? 'text-red-500' : 'text-gray-500'
          )}
        >
          {label}
        </Label>
      )}

      <div className='relative'>
        <Input
          id={name}
          ref={ref}
          name={name}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          className={cx(
            'w-full rounded-md border px-3 py-3 text-sm focus:outline-none focus:border-blue-500 text-gray-300',
            isError ? 'border-red-500 focus:ring-red-500 focus:border-red-500 text-red-500' : 'border-gray-500',
            className
          )}
          {...rest}
        />

        {typeof children === 'function'
          ? children({ isError })
          : children
        }
      </div>

      {(isError || helperText) && (
        <Description
          className={cx(
            'absolute bottom-0 right-0 text-xs',
            isError ? 'text-red-500' : 'text-gray-500'
          )}
        >
          {errors[name]?.message?.toString() || helperText}
        </Description>
      )}
    </Field>
  )
}

export default React.forwardRef(TextField)