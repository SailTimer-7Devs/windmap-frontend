import type { ReactElement } from 'react'
import type { ConfirmResetPasswordPayload } from 'types/user'
import type { SchemaFieldProps } from 'types/form'

import { useNavigate } from 'react-router'

import Form from 'components/Form'
import PasswordField from 'fields/Password'
import TextField from 'fields/Text'

import { CONFIRM_RESET_PASSWORD_FORM } from 'constants/forms'
import { CONFIRM_RESET_PASSWORD_SCHEMA } from 'constants/schemas'
import { LOGIN_ROUTE } from 'constants/routes'
import { useAuthStore } from 'store/auth'

export default function ConfirmResetPasswordForm({ email }: { email: string }): ReactElement {
  const navigate = useNavigate()
  const { confirmResetPassword } = useAuthStore()
  const { fields } = CONFIRM_RESET_PASSWORD_SCHEMA.describe() as SchemaFieldProps

  return (
    <Form.Redux<ConfirmResetPasswordPayload>
      className='w-full flex flex-col gap-2'
      name={CONFIRM_RESET_PASSWORD_FORM}
      action={confirmResetPassword}
      schema={CONFIRM_RESET_PASSWORD_SCHEMA}
      initialValues={{ email, confirmationCode: '', password: '', confirmPassword: '' }}
      mutationOptions={{ onSuccess: () => navigate(LOGIN_ROUTE) }}
    >
      <Form.Field component={TextField} label={fields.email.label} name='email'
        type='email' autoComplete='email' autoCapitalize='none' required />
      <Form.Field component={TextField} label={fields.confirmationCode.label} name='confirmationCode'
        inputMode='numeric' autoComplete='one-time-code' required />
      <Form.Field component={PasswordField} label={fields.password.label} name='password'
        autoComplete='new-password' required />
      <Form.Field component={PasswordField} label={fields.confirmPassword.label} name='confirmPassword'
        autoComplete='new-password' required />
      <Form.SubmitButton className='w-full mt-3' formName={CONFIRM_RESET_PASSWORD_FORM}>
        Set new password
      </Form.SubmitButton>
    </Form.Redux>
  )
}
