import type { ReactElement } from 'react'
import type { ConfirmSignUpPayload } from 'types/user'
import type { SchemaFieldProps } from 'types/form'

import Form from 'components/Form'
import TextField from 'fields/Text'

import { CONFIRM_SIGN_UP_FORM } from 'constants/forms'
import { CONFIRM_SIGN_UP_SCHEMA } from 'constants/schemas'

import { useAuthStore } from 'store/auth'

type ConfirmSignUpFormProps = {
  email: string
  mutationOptions?: React.ComponentProps<typeof Form.Redux>['mutationOptions']
}

function ConfirmSignUpForm({ email, mutationOptions }: ConfirmSignUpFormProps): ReactElement {
  const { confirmSignUp } = useAuthStore()
  const { fields } = CONFIRM_SIGN_UP_SCHEMA.describe() as SchemaFieldProps

  return (
    <Form.Redux<ConfirmSignUpPayload>
      className='w-full flex flex-col gap-2'
      name={CONFIRM_SIGN_UP_FORM}
      action={confirmSignUp}
      schema={CONFIRM_SIGN_UP_SCHEMA}
      initialValues={{ email, confirmationCode: '' }}
      mutationOptions={mutationOptions}
    >
      <Form.Field
        component={TextField}
        label={fields.email.label}
        name='email'
        type='email'
        autoComplete='email'
        autoCapitalize='none'
        required
      />

      <Form.Field
        component={TextField}
        label={fields.confirmationCode.label}
        name='confirmationCode'
        inputMode='numeric'
        autoComplete='one-time-code'
        required
      />

      <Form.SubmitButton
        className='w-full mt-3'
        formName={CONFIRM_SIGN_UP_FORM}
      >
        Verify account
      </Form.SubmitButton>
    </Form.Redux>
  )
}

export default ConfirmSignUpForm
