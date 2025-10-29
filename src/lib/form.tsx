import type {
  FieldValues,
  UseFormReturn,
  UseFormSetError
} from 'react-hook-form'

import type {
  FormError,
  FormErrorResponse,
  SubmitHandler
} from 'types/form'

function handleSubmissionErrors(
  errors: FormError[],
  onErrorSet: UseFormSetError<object>
) {
  errors.forEach(({ type, message }: Record<string, string>) => {
    onErrorSet(type as `root.${string}` | 'root', {
      message,
      type: type
    })
  })
}

export function createFormSubmitHandler<T extends FieldValues = FieldValues>(payload: SubmitHandler<T>) {
  const {
    cast,
    initialValues,
    onSubmit,
    onSubmitFail,
    onSubmitSuccess,
    methods,
    resetOnSuccessSubmit,
    resetValues
  } = payload

  return async (values: T): Promise<T | undefined> => {
    const fields = cast
      ? await cast(values)
      : values

    try {
      const result = await onSubmit(fields as unknown as void) as T

      if (resetOnSuccessSubmit || resetValues) {
        methods.reset((resetValues as T) || (initialValues as T))
      }

      if (result && onSubmitSuccess) {
        onSubmitSuccess(result, methods as UseFormReturn<FieldValues>)
      }

      return result
    } catch (error: unknown) {
      if (onSubmitFail) {
        onSubmitFail(error)
      }

      if (
        error &&
        typeof error === 'object' &&
        'errors' in error &&
        Array.isArray((error as FormErrorResponse).errors)
      ) {
        handleSubmissionErrors(
          (error as FormErrorResponse).errors,
          methods.setError
        )
      }
    }
  }
}
