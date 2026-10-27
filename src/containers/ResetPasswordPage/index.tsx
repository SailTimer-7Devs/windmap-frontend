import type { ReactElement } from 'react'
import React from 'react'
import { Link } from 'react-router'

import LoginTemplate from 'templates/Login'

import ResetPaswordForm from 'forms/ResetPassword'
import ConfirmResetPasswordForm from 'forms/ConfirmResetPassword'

import * as routes from 'constants/routes'

function ResetPasswordPage(): ReactElement {
  const [email, setEmail] = React.useState<string | null>(null)

  return (
    <LoginTemplate
      title={email ? 'Set a new password' : 'Forgot your password?'}
      description={email
        ? 'Enter the verification code sent to your email and choose a new password.'
        : 'Enter the email address associated with your account. We’ll email you a verification code.'}
    >
      {email
        ? <>
          <ConfirmResetPasswordForm email={email} />
          <button type='button' className='text-sm underline text-right' onClick={() => setEmail(null)}>
            Request another code
          </button>
        </>
        : <ResetPaswordForm onCodeSent={setEmail} />}

      <Link
        to={routes.LOGIN_ROUTE}
        className='underline hover:text-blue-300 text-[var(--text-primary)] text-sm text-right'>
        Return to sign in
      </Link>
    </LoginTemplate>
  )
}

export default ResetPasswordPage
