export type SignInPayload = {
  email: string
  password: string
}

export type ResetPasswordPayload = {
  email: string
}

export type SignUpPayload = {
  email: string,
  attributes: {
    email: string
  }
}

export type CurrentUser = {
  isAuthorized: boolean
}
