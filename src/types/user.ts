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
}
