import type { ReactElement } from 'react'

import { Link, useNavigate, useSearchParams } from 'react-router'

import LoginTemplate from 'templates/Login'
import ConfirmSignUpForm from 'forms/ConfirmSignUp'

import * as routes from 'constants/routes'

function LoginConfirmPage(): ReactElement {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const email = searchParams.get('email') || ''

  return (
    <LoginTemplate
      title='Verify your email'
      description='Enter the 6-digit verification code sent to your email address.'
    >
      <ConfirmSignUpForm
        email={email}
        mutationOptions={{
          onSuccess: () => navigate(routes.LOGIN_ROUTE)
        }}
      />

      <Link
        to={routes.LOGIN_ROUTE}
        className='text-center text-sm text-[var(--primary-dark)] underline underline-offset-2 hover:text-blue-300'
      >
        Back to sign in
      </Link>
    </LoginTemplate>
  )
}

export default LoginConfirmPage
