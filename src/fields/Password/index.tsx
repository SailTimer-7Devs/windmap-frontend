import React from 'react'

import TextField from 'fields/Text'

import Button from 'components/Button'
import EyeIcon from 'icons/Eye'
import EyeOffIcon from 'icons/EyeSlash'

type PasswordFieldProps = React.ComponentProps<typeof TextField>

function PasswordField(
  props: PasswordFieldProps,
  ref: React.ForwardedRef<HTMLInputElement>
) {
  const [showPassword, setShowPassword] = React.useState(false)

  const handleTogglePassword = React.useCallback(() => {
    setShowPassword((prev) => !prev)
  }, [])

  return (
    <TextField
      {...props}
      ref={ref}
      type={showPassword ? 'text' : 'password'}
      className='pr-10'
    >
      {({ isError }) => {
        const errorClass = isError ? 'text-red-500' : ''

        return (
          <Button
            type='button'
            onClick={handleTogglePassword}
            className='absolute right-2 top-1/2 -translate-y-1/2 bg-transparent'
          >
            {showPassword
              ? <EyeOffIcon className={errorClass} />
              : <EyeIcon className={errorClass} />
            }
          </Button>
        )
      }}
    </TextField>
  )
}

export default React.forwardRef(PasswordField)