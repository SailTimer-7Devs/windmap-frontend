import type { ReactElement } from 'react'
import type { LayersMenuProps } from 'types'

import DropdownMenu from 'components/DropdownMenu'

import { EyeIcon } from 'icons/Eye'
import { EyeSlashIcon } from 'icons/EyeSlash'

import { ACTIONS_MENU_LIST } from 'constants/layers'

const ICON_STYLES = {
  className: 'shrink-0'
}

const LayersMenu = ({ layersId, toggle }: LayersMenuProps): ReactElement => {
  const options = ACTIONS_MENU_LIST.map(({ id, name }) => ({
    label: name,
    icon: layersId.includes(id)
      ? <EyeIcon {...ICON_STYLES} />
      : <EyeSlashIcon {...ICON_STYLES} />,
    onClick: () => toggle(id)
  }))

  return (
    <DropdownMenu
      caption='Layers'
      options={options}
    />
  )
}

export default LayersMenu
