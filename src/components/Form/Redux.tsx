import type { FieldValues } from 'react-hook-form'
import type { FormReduxProps } from 'types/form'
import type { ReactElement } from 'react'

import { useMutation } from '@tanstack/react-query'

import React from 'react'

import FormBase from 'components/Form/Base'

function FormRedux<P, T extends FieldValues = FieldValues>(props: FormReduxProps<T, P>): ReactElement {
  const {
    action,
    children,
    mutationOptions,
    onSubmit,
    ...restProps
  } = props

  const handleSubmit = React.useCallback(async (values: unknown) => {
    if (action) {
      return action(values as P)
    }

    if (onSubmit) {
      return await onSubmit(values as P)
    }
  }, [])

  const { mutateAsync } = useMutation({
    mutationFn: handleSubmit,
    ...mutationOptions
  })

  return (
    <FormBase<T>
      onSubmit={mutateAsync}
      {...restProps}
    >
      {children}
    </FormBase>
  )
}

export default FormRedux
