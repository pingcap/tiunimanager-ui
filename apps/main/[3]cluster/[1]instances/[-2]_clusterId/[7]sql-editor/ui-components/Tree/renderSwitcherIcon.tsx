import classNames from 'clsx'
import { isValidElement, cloneElement } from 'react'
import { Icon } from 'semantic-ui-react'

import type { SwitcherIcon, TreeLeafIcon, TreeNodeProps } from './index'

export default function renderSwitcherIcon(
  prefixCls: string,
  switcherIcon: SwitcherIcon,
  showLine: boolean | { showLeafIcon: boolean | TreeLeafIcon } | undefined,
  treeNodeProps: TreeNodeProps
): React.ReactNode {
  const { isLeaf, expanded, loading } = treeNodeProps

  if (loading) {
    return <Icon name="spinner" loading className={`${prefixCls}-switcher-loading-icon`} />
  }
  let showLeafIcon: boolean | TreeLeafIcon
  if (showLine && typeof showLine === 'object') {
    showLeafIcon = showLine.showLeafIcon
  }

  if (isLeaf) {
    if (!showLine) {
      return null
    }

    if (typeof showLeafIcon !== 'boolean' && !!showLeafIcon) {
      const leafIcon = typeof showLeafIcon === 'function' ? showLeafIcon(treeNodeProps) : showLeafIcon
      const leafCls = `${prefixCls}-switcher-line-custom-icon`

      if (isValidElement(leafIcon)) {
        return cloneElement(leafIcon, {
          //@ts-ignore
          className: classNames(leafIcon.props.className || '', leafCls)
        })
      }

      return leafIcon
    }

    return showLeafIcon ? (
      <Icon name="file outline" className={`${prefixCls}-switcher-line-icon`} />
    ) : (
      <span className={`${prefixCls}-switcher-leaf-line`} />
    )
  }

  const switcherCls = `${prefixCls}-switcher-icon`

  const switcher = typeof switcherIcon === 'function' ? switcherIcon(treeNodeProps) : switcherIcon

  if (isValidElement(switcher)) {
    return cloneElement(switcher, {
      //@ts-ignore
      className: classNames(switcher.props.className || '', switcherCls)
    })
  }

  if (switcher) {
    return switcher
  }

  if (showLine) {
    return expanded ? (
      <Icon name="minus" size="small" className={`${prefixCls}-switcher-line-icon`} />
    ) : (
      <Icon name="plus" size="small" className={`${prefixCls}-switcher-line-icon`} />
    )
  }
  return <Icon name="caret down" className={switcherCls} />
}
