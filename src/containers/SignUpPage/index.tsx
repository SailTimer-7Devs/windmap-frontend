import type { ReactElement } from 'react'
import { Link, useNavigate } from 'react-router'

import LoginTemplate from 'templates/Login'

import SignUpForm from 'forms/SignUp'

import * as routes from 'constants/routes'

function SignUpPage(): ReactElement {
  const navigate = useNavigate()

  return (
    <LoginTemplate
      title='Create an account'
      description='Create your SailTimer account to access subscribed weather maps. We’ll email you a verification code.'
    >
      <span className='text-sm text-[var(--text-secondary)] flex gap-2'>
        Already have an account?

        <Link to={routes.LOGIN_ROUTE} className='hover:text-blue-300 text-[var(--primary-dark)] text-sm'>
          Sign in
        </Link>
      </span>

      <SignUpForm
        mutationOptions={{
          onSuccess: (_result, variables) => {
            const { email } = variables as unknown as { email: string }
            navigate(`${routes.LOGIN_CONFIRM_ROUTE}?email=${encodeURIComponent(email)}`)
          }
        }}
      />
    </LoginTemplate>
  )
}

export default SignUpPage
