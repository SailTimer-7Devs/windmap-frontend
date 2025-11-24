import * as yup from 'yup'

const requiredMessage = 'This field is required'
const notValidEmail = 'Email is not valid'

export const SIGN_IN_SCHEMA = yup.object({
  email: yup.string()
    .label('Email')
    .email(notValidEmail)
    .required(requiredMessage)
    .default(''),
  password: yup.string()
    .label('Password')
    .required(requiredMessage)
    .min(8, 'Password must be at least 8 characters')
    .default('')
})

export const RESET_PASSWORD_SCHEMA = yup.object({
  email: yup.string()
    .label('Email')
    .email(notValidEmail)
    .required(requiredMessage)
    .default('')
})
