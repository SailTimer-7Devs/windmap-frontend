import type { PropsWithChildren, ReactElement } from 'react'
import type { SignInPayload } from 'types/user'
import type { SchemaFieldProps } from 'types/form'

import Form from 'components/Form'

import TextField from 'fields/Text'

import { RESET_PASSWORD_FORM } from 'constants/forms'
import { RESET_PASSWORD_SCHEMA } from 'constants/schemas'

import { useAuthStore } from 'store/auth'

const INITIAL_VALUES = RESET_PASSWORD_SCHEMA.getDefault()

function ResetPasswordForm({ children }: PropsWithChildren): ReactElement {
  const { resetPassword } = useAuthStore()

  const { fields } = RESET_PASSWORD_SCHEMA.describe() as SchemaFieldProps

  return (
    <Form.Redux<SignInPayload>
      className='w-full flex flex-col gap-2'
      name={RESET_PASSWORD_FORM}
      action={resetPassword}
      schema={RESET_PASSWORD_SCHEMA}
      initialValues={INITIAL_VALUES}
    >
      <Form.Field
        component={TextField}
        label={fields.email.label}
        name='email'
        required
      />

      {children}

      <Form.SubmitButton
        className='w-full mt-3'
        formName={RESET_PASSWORD_FORM}
      >
        Reset Password
      </Form.SubmitButton>
    </Form.Redux>
  )
}

export default ResetPasswordForm
