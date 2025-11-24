import type { ReactElement } from 'react'
import { Link } from 'react-router'

import LoginTemplate from 'templates/Login'

import ResetPaswordForm from 'forms/ResetPassword'

import * as routes from 'constants/routes'

function ResetPasswordPage(): ReactElement {
  return (
    <LoginTemplate
      title='Forgot your password?'
      description='Please enter the email address associated with your account, and we`ll email you a link to reset your password.'
    >
      <ResetPaswordForm />

      <Link
        to={routes.LOGIN_ROUTE}
        className='underline hover:text-blue-300 text-[var(--text-primary)] text-sm text-right'>
        Return to sign in
      </Link>
    </LoginTemplate>
  )
}

export default ResetPasswordPage
