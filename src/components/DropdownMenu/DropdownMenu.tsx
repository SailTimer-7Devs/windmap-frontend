import type { ReactElement } from 'react'
import type { DropdownMenuProps } from 'types'

import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems
} from '@headlessui/react'

import { ChevronDownIcon } from 'icons/ChevronDown'

const DropdownMenu = ({ caption, options }: DropdownMenuProps): ReactElement => {
  const handleMenuClick = (
    e: React.MouseEvent<HTMLButtonElement>,
    onClick?: () => void,
    close?: () => void
  ) => {
    e.preventDefault()
    e.stopPropagation()

    if (onClick) onClick()
    if (close) return null
  }

  return (
    <Menu>
      <MenuButton className='inline-flex items-center gap-2 rounded-full bg-gray-800 py-3 px-4 text-sm/6 font-semibold text-white shadow-inner shadow-white/10 focus:outline-none data-[hover]:bg-gray-700 data-[open]:bg-gray-700 data-[focus]:outline-1 data-[focus]:outline-white transition duration-100'>
        {caption}
        <ChevronDownIcon className='size-2 fill-white/60' />
      </MenuButton>

      <MenuItems
        transition
        anchor='bottom end'
        className='w-52 origin-top-right rounded-xl border border-white/5 bg-gray-800 p-1 text-sm/6 text-white transition duration-100 ease-out [--anchor-gap:var(--spacing-1)] focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0'
      >
        {options.map(({ label, icon, onClick }) => (
          <MenuItem key={label}>
            {({ close }) => (
              <button
                className='w-full group flex gap-2 text-left rounded-lg py-1.5 px-3 data-[focus]:bg-white/10'
                onClick={(e) => handleMenuClick(e, onClick, close)}
              >
                {icon}
                {label}
              </button>
            )}
          </MenuItem>
        ))}
      </MenuItems>
    </Menu>
  )
}

export default DropdownMenu
