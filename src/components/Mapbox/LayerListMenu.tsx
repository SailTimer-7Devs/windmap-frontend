import type { ReactElement } from 'react'
import type { LayersMenuProps } from 'types'

import React from 'react'

import DropdownMenu from 'components/DropdownMenu'

import EyeIcon from 'icons/Eye'

import useCurrentTarget from 'hooks/useCurrentTarget'

const ICON_STYLES = {
  className: 'shrink-0'
}

const LayerListMenu = ({
  menuList,
  layersId,
  toggle
}: LayersMenuProps): ReactElement => {
  const [submenuAnchor, setSubmenuAnchor] = useCurrentTarget<string | null>(null)
  const [isSubmenuOpen, setIsSubmenuOpen] = React.useState(false)

  const handleSubmenuOpen = React.useCallback(
    (label: string) => {
      setIsSubmenuOpen(false)
      setSubmenuAnchor(label)
      setIsSubmenuOpen(prev => !prev)
    },
    [setSubmenuAnchor]
  )

  const options = React.useMemo(
    () => menuList.map((item) => {
      const { id, name, icon: Icon = EyeIcon, items } = item

      return {
        label: name,
        icon: React.isValidElement(Icon) ? Icon : <Icon {...ICON_STYLES} />,
        onClick: id
          ? () => {
            toggle(id)
            setIsSubmenuOpen(false)
          }
          : () => handleSubmenuOpen(name),
        checked: id
          ? layersId.includes(id)
          : items?.some(({ id }) => layersId.includes(id)),
        items: items?.map(({ id: subitemId, name }) => ({
          label: name,
          checked: layersId.includes(subitemId),
          onClick: () => toggle(subitemId)
        }))
      }
    }),
    [menuList, layersId, toggle, handleSubmenuOpen]
  )

  return (
    <DropdownMenu
      caption='Layers'
      options={options}
      submenuAnchor={submenuAnchor}
      isSubmenuOpen={isSubmenuOpen}
    />
  )
}

export default LayerListMenu
