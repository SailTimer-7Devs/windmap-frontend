import type { ReactElement } from 'react'
import type { LayersMenuProps } from 'types'

import React from 'react'

import DropdownMenu from 'components/DropdownMenu'

import { EyeIcon } from 'icons/Eye'
import { EyeSlashIcon } from 'icons/EyeSlash'

const ICON_STYLES = {
  className: 'shrink-0'
}

const LayerListMenu = ({
  menuList,
  layersId,
  toggle
}: LayersMenuProps): ReactElement => {
  const options = React.useMemo(
    () => menuList.map(({ id, name }) => ({
      label: name,
      icon: layersId.includes(id)
        ? <EyeIcon {...ICON_STYLES} />
        : <EyeSlashIcon {...ICON_STYLES} />,
      onClick: () => toggle(id)
    })), [menuList, layersId, toggle]
  )

  return (
    <DropdownMenu
      caption='Layers'
      options={options}
    />
  )
}

export default LayerListMenu
