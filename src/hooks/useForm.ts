import type {
  DefaultValues,
  FieldValues,
  UseFormReturn
} from 'react-hook-form'

import type { UseFormHookPayload } from 'types/form'

import { useForm as reactHookFormUseForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'

export default function useForm<T extends FieldValues = FieldValues>(payload: UseFormHookPayload): UseFormReturn<T> {
  const { initialValues, schema, ...restProps } = payload

  return reactHookFormUseForm({
    ...restProps,
    defaultValues: initialValues as DefaultValues<FieldValues>,
    resolver: schema ? yupResolver(schema) : undefined
  })
}
