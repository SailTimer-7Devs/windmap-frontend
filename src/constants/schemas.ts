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

export const SIGN_UP_SCHEMA = yup.object({
  email: yup.string()
    .label('Email')
    .email(notValidEmail)
    .required(requiredMessage)
    .default(''),
  password: yup.string()
    .label('Password')
    .required(requiredMessage)
    .min(8, 'Password must be at least 8 characters')
    .default(''),
  confirmPassword: yup.string()
    .label('Confirm password')
    .required(requiredMessage)
    .oneOf([yup.ref('password')], 'Passwords must match')
    .default('')
})

export const CONFIRM_SIGN_UP_SCHEMA = yup.object({
  email: yup.string()
    .label('Email')
    .email(notValidEmail)
    .required(requiredMessage)
    .default(''),
  confirmationCode: yup.string()
    .label('Verification code')
    .required(requiredMessage)
    .matches(/^\d{6}$/, 'Enter the 6-digit verification code')
    .default('')
})
