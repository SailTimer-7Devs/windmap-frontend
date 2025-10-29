import type { ReactElement } from 'react'
import type { FormProps } from 'types/form'
import type { GenericObject } from 'types'
import type { FieldValues, SubmitHandler } from 'react-hook-form'

import React from 'react'
import _isEqual from 'lodash/isEqual'

import { scrollToErrorField } from 'lib/dom'
import { createFormSubmitHandler } from 'lib/form'

import useForm from 'hooks/useForm'
import useFormLogger from 'hooks/useFormLogger'

import FormProvider from './Provider'

function FormBase<T extends FieldValues = FieldValues>(props: FormProps<T>): ReactElement {
  const {
    cast,
    children,
    className,
    initialValues = {},
    name,
    onSubmit,
    onSubmitFail,
    onSubmitSuccess,
    resetValues,
    submitOnChange = false,
    resetOnSuccessSubmit = !submitOnChange,
    ...restProps
  } = props

  const form = useForm<T>({
    initialValues: initialValues as GenericObject,
    ...restProps
  })
  const { handleSubmit } = form

  useFormLogger<T>(form, { formName: name })

  const submit = React.useCallback(
    createFormSubmitHandler<T>({
      cast,
      initialValues,
      onSubmit,
      onSubmitFail,
      onSubmitSuccess,
      resetOnSuccessSubmit,
      methods: form,
      resetValues: resetValues as GenericObject
    }),
    [
      cast,
      initialValues,
      onSubmit,
      onSubmitFail,
      onSubmitSuccess,
      resetOnSuccessSubmit,
      form,
      resetValues
    ]
  )

  const previousValues = React.useRef(form.getValues())

  React.useEffect(() => {
    const currentValues = form.getValues()
    if (!_isEqual(currentValues, initialValues)) {
      form.reset(initialValues as T)
    }
  }, [initialValues, form])

  React.useEffect(() => {
    if (!submitOnChange) return

    const subscription = form.watch((values) => {
      if (!_isEqual(previousValues.current, values)) {
        previousValues.current = values as T

        form.handleSubmit(submit as SubmitHandler<T>)()
      }
    })

    return () => subscription.unsubscribe()
  }, [form, submitOnChange, submit])

  return (
    <FormProvider {...form}>
      <form
        className={className}
        id={name}
        noValidate
        onSubmit={handleSubmit(
          submit as SubmitHandler<T>,
          scrollToErrorField
        )}
      >
        {children}
      </form>
    </FormProvider>
  )
}

export default FormBase
