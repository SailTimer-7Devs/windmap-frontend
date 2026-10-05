export type SignInPayload = {
  email: string
  password: string
}

export type ResetPasswordPayload = {
  email: string
}

export type SignUpPayload = {
  email: string
  password: string
  confirmPassword: string
}

export type ConfirmSignUpPayload = {
  email: string
  confirmationCode: string
}

export type CurrentUser = {
  isAuthorized: boolean
  // The SailTimer app handed over a valid login, but the subscription record
  // has not reached the server yet. Shown instead of the web login page.
  activationPending?: boolean
}
