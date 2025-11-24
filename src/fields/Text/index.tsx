import type { ForwardedRef, ReactElement, ReactNode } from 'react'
import type { FieldValues, Path } from 'react-hook-form'

import React, { useState } from 'react'
import { clsx as cx } from 'clsx'
import { Description, Field, Input, Label } from '@headlessui/react'

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
    type = 'text',
    disabled,
    helperText,
    className,
    children,
    ...restProps
  } = props

  const { control, getValues } = useFormContext()
  const { errors } = useFormState({ name, control, exact: true })
  const isError = Boolean(errors[name])

  const defaultValue = getValues(name)
  const [focused, setFocused] = useState(true)

  const isFloating = focused || Boolean(defaultValue)

  React.useEffect(() => {
    if (defaultValue) {
      setFocused(false)
    }
  }, [])

  return (
    <Field className='relative pb-5 text-[var(--text-secondary)]'>
      <div className='relative'>
        {label && (
          <Label
            htmlFor={name}
            className={cx(
              'absolute left-3 transition-all duration-200 pointer-events-none text-[var(--text-secondary)]',
              isFloating
                ? 'top-1 text-xs'
                : 'top-1/2 -translate-y-1/2 text-base',
              isError && 'text-red-500'
            )}
          >
            {label}
          </Label>
        )}

        <Input
          id={name}
          ref={ref}
          name={name}
          type={type}
          disabled={disabled}
          value={defaultValue}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={cx(
            'w-full h-14 rounded-md border px-3 pt-5 pb-2 text-sm bg-white',
            'focus:outline-none focus:border-blue-500 text-[var(--text-primary)]',
            isError
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500 text-red-500'
              : 'border-gray-400',
            className
          )}
          {...restProps}
        />

        {typeof children === 'function'
          ? children({ isError })
          : children}
      </div>

      {(isError || helperText) && (
        <Description
          className={cx(
            'absolute bottom-0 left-0 text-xs',
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
