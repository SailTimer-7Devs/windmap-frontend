import type { ReactElement } from 'react'

import DropdownMenu from 'components/DropdownMenu'

import BRAND_MENU_LIST from 'constants/brandMenu'
import { particlesExplanations } from 'constants/brandMenu'

import { useAuthStore } from 'store/auth'

const BrandMenu = ({ isWindLayer }: { isWindLayer: boolean }): ReactElement => {
  const { signOut } = useAuthStore()
  const logoutItem = {
    hint: 'Log out',
    onClick: signOut
  }

  const brandMenuOptions = [
    ...BRAND_MENU_LIST,
    ...(isWindLayer ? particlesExplanations : []),
    logoutItem
  ]

  return (
    <DropdownMenu
      caption='SailTimer ™'
      options={brandMenuOptions}
    />
  )
}

export default BrandMenu
