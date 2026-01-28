
import type { ReactElement } from 'react'
import type { DropdownMenuProps } from 'types'

import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems
} from '@headlessui/react'

import ChevronDownIcon from 'icons/ChevronDown'
import DotIcon from 'icons/Dot'

const ITEM_STYLES = 'w-full group flex justify-between items-center rounded-lg py-1.5 px-3 data-[focus]:bg-white/10'

const DropdownMenu = ({ caption, options, isSubmenuOpen, submenuAnchor }: DropdownMenuProps): ReactElement => {
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

  const ItemContent = (props: ItemComponentProps) => {
    const { icon, label, checked, items, hint, isLogout } = props
    return (
      <>
        <div className='flex items-center justify-between w-full'>
          <div className='flex flex-col'>
            <p className={`flex gap-3 ${isLogout && 'text-[12px]'}`}>
              {icon}
              {label}
            </p>

            {hint && (
              <span className='text-xs text-white/60 text-start [text-transform:initial]'>
                {hint}
              </span>
            )}
          </div>

          {checked && <DotIcon />}
        </div>

        {items && <ChevronDownIcon className='size-2 fill-white/60 ml-1' />}
      </>
    )
  }

  const ItemComponent = ({ close, href, icon, label, checked, onClick, items, hint, isLogout }: ItemComponentProps) => {
    if (href) {
      return (
        <a
          href={href}
          rel='nofollow noopener noreferrer'
          target='_blank'
          className={ITEM_STYLES}
          onClick={close}
        >
          <ItemContent
            icon={icon}
            label={label}
            checked={checked}
            items={items}
            hint={hint}
          />
        </a>
      )
    } else {
      return (
        <button
          className={`${ITEM_STYLES} capitalize`}
          type='button'
          onClick={(e) => handleMenuClick(e, onClick, close)}
        >
          <ItemContent
            icon={icon}
            label={label}
            checked={checked}
            items={items}
            hint={hint}
            isLogout={isLogout}
          />
        </button>
      )
    }
  }

  return (
    <Menu>
      <MenuButton className='inline-flex items-center gap-2 rounded-xl bg-gray-800 py-3 px-4 text-sm/6 font-semibold text-white shadow-inner shadow-white/10 focus:outline-none data-[hover]:bg-gray-700 data-[open]:bg-gray-700 data-[focus]:outline-1 data-[focus]:outline-white transition duration-100'>
        {caption}

        <ChevronDownIcon className='size-2 fill-white/60' />
      </MenuButton>

      <MenuItems
        transition
        anchor='bottom end'
        className='w-66 mt-1 origin-top-right !overflow-visible rounded-xl border border-white/5 bg-gray-800 p-1 text-sm/6 text-white transition duration-100 ease-out [--anchor-gap:var(--spacing-1)] focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0'
      >
        {options.map(({ label, icon, onClick, href, checked, items, hint, isLogout }) => {
          return (
            <MenuItem key={label}>
              {({ close }) => (
                <div className='relative'>
                  <ItemComponent
                    items={items}
                    close={close}
                    icon={icon}
                    label={label}
                    checked={checked}
                    onClick={onClick}
                    href={href}
                    hint={hint}
                    isLogout={isLogout}
                  />

                  {isSubmenuOpen && submenuAnchor === label && items && (
                    <div className='absolute left-[-60%] bottom-[-4px] w-36 rounded-xl border border-white/5 bg-gray-800 p-1 text-sm text-white shadow-lg transition-all duration-150 ease-out z-20'>
                      {items.map((sub) => (
                        <button
                          key={sub.label}
                          type='button'
                          className={`${ITEM_STYLES} capitalize h-9`}
                          onClick={(e) => handleMenuClick(e, sub.onClick, close)}
                        >
                          <ItemContent
                            label={sub.label}
                            checked={sub.checked}
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </MenuItem>
          )
        })}
      </MenuItems>
    </Menu>
  )
}

type ItemComponentProps = {
  items?: {
    label: string
    icon?: ReactElement
    onClick?: () => void
  }[]
  icon?: ReactElement
  label?: string
  checked?: boolean
  onClick?: () => void | undefined
  href?: string
  close?: () => void | ((e: React.MouseEvent<HTMLElement>) => void)
  hint?: string
  isLogout?: boolean
}

export default DropdownMenu

