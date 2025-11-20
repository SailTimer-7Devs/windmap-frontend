import type { AnyObjectSchema, ObjectSchema } from 'yup'

import type {
  FieldValues,
  UseFormProps,
  UseFormReturn
} from 'react-hook-form'

import type {
  UseMutationOptions,
  UseMutateAsyncFunction
} from '@tanstack/react-query'

export type FormError = {
  message: string
  type: string
}

export type FormErrorResponse = {
  errors: FormError[]
}

export type FormSubmitSuccessHandler<T = object> = (
  result: Record<string, T>,
  formMethods: UseFormReturn<FieldValues>
) => void

export type FormSubmitFailHandler = (e: unknown) => void

export interface FormBaseProps<T = object> {
  cast?: (values: T) => object | Promise<object>
  initialValues?: object
  onSubmit: UseMutateAsyncFunction
  onSubmitFail?: FormSubmitFailHandler
  onSubmitSuccess?: FormSubmitSuccessHandler<T>
  resetOnSuccessSubmit?: boolean
  resetValues?: object
}

export type SubmitHandler<T extends FieldValues = FieldValues> = FormBaseProps<T> & {
  methods: UseFormReturn<T>
}

export interface FormProps<T> extends FormBaseProps<T> {
  children: React.ReactNode
  className?: string
  name: string
  submitOnChange?: boolean
}

export interface FormDefaultProps<T> extends Omit<FormProps<T>, 'onSubmit'> {
  onSubmitSuccess?: FormSubmitSuccessHandler<T>
  onSubmitFail?: FormSubmitFailHandler
  schema?: ObjectSchema<object>
  mutationOptions?: UseMutationOptions
}

export interface FormReduxProps<
  T = object,
  P = object
> extends Omit<FormProps<T>, 'onSubmit'> {
  action?: (payload: P) => void
  onSubmitSuccess?: FormSubmitSuccessHandler<T>
  onSubmitFail?: FormSubmitFailHandler
  onSubmit?: (payload: P) => unknown
  schema?: ObjectSchema<object>
  mutationOptions?: UseMutationOptions
}

export type UseFormHookPayload = Omit<
  Partial<UseFormProps<FieldValues>>,
  'defaultValues' | 'resolver'
> & {
  initialValues: FieldValues
  schema?: AnyObjectSchema
}

export type SchemaFieldProps = {
  fields: Record<string, { label?: string }>
}
