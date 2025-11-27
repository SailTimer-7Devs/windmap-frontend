import type { PropsWithChildren, ReactElement } from 'react'
import type { SignInPayload } from 'types/user'
import type { SchemaFieldProps } from 'types/form'

import { Link } from 'react-router'

import Form from 'components/Form'

import PasswordField from 'fields/Password'
import TextField from 'fields/Text'

import { SIGN_IN_FORM } from 'constants/forms'
import { SIGN_IN_SCHEMA } from 'constants/schemas'
import * as routes from 'constants/routes'

import { useAuthStore } from 'store/auth'

const INITIAL_VALUES = SIGN_IN_SCHEMA.getDefault()

function SignInForm({ children }: PropsWithChildren): ReactElement {
  const { signIn } = useAuthStore()

  const { fields } = SIGN_IN_SCHEMA.describe() as SchemaFieldProps

  return (
    <Form.Redux<SignInPayload>
      className='w-full flex flex-col gap-2'
      name={SIGN_IN_FORM}
      action={signIn}
      schema={SIGN_IN_SCHEMA}
      initialValues={INITIAL_VALUES}
    >
      <Form.Field
        component={TextField}
        label={fields.email.label}
        name='email'
        required
      />

      <Form.Field
        component={PasswordField}
        label={fields.password.label}
        name='password'
        required
      />

      {children}

      <Link
        to={routes.PASSWORD_RESET_ROUTE}
        className='underline hover:text-blue-300 text-[var(--text-primary)] text-sm text-right'>
        Forgot password?
      </Link>

      <Form.SubmitButton
        className='w-full mt-3'
        formName={SIGN_IN_FORM}
      >
        Login
      </Form.SubmitButton>
    </Form.Redux>
  )
}

export default SignInForm
