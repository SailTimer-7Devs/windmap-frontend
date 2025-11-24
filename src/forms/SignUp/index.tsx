import type { PropsWithChildren, ReactElement } from 'react'
import type { SignUpPayload } from 'types/user'
import type { SchemaFieldProps } from 'types/form'

import Form from 'components/Form'

import TextField from 'fields/Text'

import { SIGN_UP_FORM } from 'constants/forms'
import { SIGN_UP_SCHEMA } from 'constants/schemas'

import { useAuthStore } from 'store/auth'

const INITIAL_VALUES = SIGN_UP_SCHEMA.getDefault()

function SignUpForm({ children }: PropsWithChildren): ReactElement {
  const { signUp } = useAuthStore()

  const { fields } = SIGN_UP_SCHEMA.describe() as SchemaFieldProps

  return (
    <Form.Redux<SignUpPayload>
      className='w-full flex flex-col gap-2'
      name={SIGN_UP_FORM}
      action={signUp}
      schema={SIGN_UP_SCHEMA}
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
        formName={SIGN_UP_FORM}
      >
        Verify Email
      </Form.SubmitButton>
    </Form.Redux>
  )
}

export default SignUpForm
