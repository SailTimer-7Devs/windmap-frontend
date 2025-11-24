import type { ReactElement } from 'react'
import { Link } from 'react-router'

import LoginTemplate from 'templates/Login'

import SignUpForm from 'forms/SignUp'

import * as routes from 'constants/routes'

function SignUpPage(): ReactElement {
  return (
    <LoginTemplate title='Create an account'>
      <span className='text-sm text-[var(--text-secondary)] flex gap-2'>
        Already have an account?

        <Link to={routes.LOGIN_ROUTE} className='hover:text-blue-300 text-[var(--primary-dark)] text-sm'>
          Sign in
        </Link>
      </span>

      <SignUpForm />
    </LoginTemplate>
  )
}

export default SignUpPage
