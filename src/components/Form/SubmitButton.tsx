import type { Control, FieldValues } from 'react-hook-form'
import type { ReactElement, ReactNode } from 'react'

import Button from 'components/Button'

import SpinnerIcon from 'icons/Spinner'

import { clsx as cx } from 'clsx'

import useFormState from 'hooks/useFormState'

type Props = {
  children: ReactNode
  formName: string
  control?: Control<FieldValues>
  disabled?: boolean
  loading?: boolean
  className?: string
}

function SubmitButton(props: Props): ReactElement {
  const {
    children,
    disabled,
    loading,
    formName,
    control,
    className = '',
    ...restProps
  } = props

  const { isSubmitting, isDirty } = useFormState({ control })

  const isDisabled =
    isSubmitting || (typeof disabled === 'undefined' ? !isDirty : disabled)

  const isLoading = isSubmitting || loading

  return (
    <Button
      type='submit'
      form={formName}
      disabled={isDisabled}
      className={cx(
        'inline-flex items-center justify-center gap-2 rounded-md py-3 px-4 text-sm/6 font-semibold text-white transition duration-100 cursor-pointer',
        isDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-800 hover:bg-blue-900',
        className
      )}
      {...restProps}
    >
      {children}

      {isLoading && (
        <SpinnerIcon className='text-gray-200 animate-spin dark:text-gray-600 fill-blue-600' />
      )}
    </Button>
  )
}

export default SubmitButton
