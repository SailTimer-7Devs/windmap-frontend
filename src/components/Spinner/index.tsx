import { Transition } from '@headlessui/react'

interface SpinnerProps {
  show: boolean
  size?: 'sm' | 'md' | 'lg'
  label?: string 
}

const SIZE_CLASSES: Record<NonNullable<SpinnerProps['size']>, string> = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-10 h-10'
}

export default function Spinner({ show, size = 'lg', label = 'Loading' }: SpinnerProps) {
  const sizeClass = SIZE_CLASSES[size]

  return (
    <Transition
      show={show}
      enter="transition-opacity duration-150"
      enterFrom="opacity-0 scale-95"
      enterTo="opacity-100 scale-100"
      leave="transition-opacity duration-150"
      leaveFrom="opacity-100 scale-100"
      leaveTo="opacity-0 scale-95"
    >
      <div
        role="status"
        aria-live="polite"
        className="inline-flex items-center justify-center text-sky-500"
      >
        <svg
          className={`${sizeClass} animate-spin`}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>

        <span className="sr-only">{label}</span>
      </div>
    </Transition>
  )
}
