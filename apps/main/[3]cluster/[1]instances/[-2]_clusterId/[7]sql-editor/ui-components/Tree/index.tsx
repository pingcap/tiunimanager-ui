import 'rc-tree/assets/index.css'
import clsx from 'clsx'
import RcTree from 'rc-tree'
import type { TreeProps as RcTreeProps, BasicDataNode } from 'rc-tree'
import type { DataNode, Key } from 'rc-tree/lib/interface'
// import React from 'react'

import { collapseMotion } from './motion'
import renderSwitcherIcon from './renderSwitcherIcon'
import './index.css'

export type { DataNode as TreeDataNode, EventDataNode as TreeEventDataNode } from 'rc-tree/lib/interface'

export type SwitcherIcon = React.ReactNode | ((props: TreeNodeProps) => React.ReactNode)
export type TreeLeafIcon = React.ReactNode | ((props: TreeNodeProps) => React.ReactNode)

export interface TreeProps<T extends BasicDataNode = DataNode>
  extends Omit<RcTreeProps<T>, 'prefixCls' | 'showLine' | 'direction' | 'draggable' | 'icon' | 'switcherIcon'> {
  showLine?: boolean | { showLeafIcon: boolean | TreeLeafIcon }
  className?: string
  /** 是否支持多选 */
  multiple?: boolean
  /** 是否自动展开父节点 */
  autoExpandParent?: boolean
  /** 是否支持选中 */
  checkable?: boolean
  /** 是否禁用树 */
  disabled?: boolean
  /** 默认展开所有树节点 */
  defaultExpandAll?: boolean
  /** 默认展开对应树节点 */
  defaultExpandParent?: boolean
  /** 默认展开指定的树节点 */
  defaultExpandedKeys?: Key[]
  /** （受控）展开指定的树节点 */
  expandedKeys?: Key[]
  /** （受控）选中复选框的树节点 */
  checkedKeys?: Key[] | { checked: Key[]; halfChecked: Key[] }
  /** 默认选中复选框的树节点 */
  defaultCheckedKeys?: Key[]
  /** （受控）设置选中的树节点 */
  selectedKeys?: Key[]
  /** 默认选中的树节点 */
  defaultSelectedKeys?: Key[]
  selectable?: boolean
  prefixCls?: string
  style?: React.CSSProperties
  showIcon?: boolean
  children?: React.ReactNode
  blockNode?: boolean
  switcherIcon?: SwitcherIcon | RcTreeProps<T>['switcherIcon']
}

export interface TreeNodeProps {
  className?: string
  checkable?: boolean
  disabled?: boolean
  disableCheckbox?: boolean
  title?: string | React.ReactNode
  key?: Key
  eventKey?: string
  isLeaf?: boolean
  checked?: boolean
  expanded?: boolean
  loading?: boolean
  selected?: boolean
  selectable?: boolean
  icon?: ((treeNode: TreeNodeAttribute) => React.ReactNode) | React.ReactNode
  children?: React.ReactNode
  [customProp: string]: any
}

export interface TreeNodeAttribute {
  eventKey: string
  prefixCls: string
  className: string
  expanded: boolean
  selected: boolean
  checked: boolean
  halfChecked: boolean
  children: React.ReactNode
  title: React.ReactNode
  pos: string
  dragOver: boolean
  dragOverGapTop: boolean
  dragOverGapBottom: boolean
  isLeaf: boolean
  selectable: boolean
  disabled: boolean
  disableCheckbox: boolean
}

export const Tree = React.forwardRef<RcTree, TreeProps>((props, ref) => {
  const {
    prefixCls = 'tc-uikit-tree',
    className,
    switcherIcon,
    showIcon = false,
    showLine,
    blockNode = false,
    children,
    checkable = false,
    selectable = true,
    motion = { ...collapseMotion, motionAppear: false }
  } = props

  const newProps = {
    ...props,
    checkable,
    selectable,
    showIcon,
    motion,
    blockNode,
    showLine: Boolean(showLine)
  }

  return (
    <RcTree
      {...newProps}
      itemHeight={20}
      ref={ref}
      className={clsx(
        {
          [`${prefixCls}-icon-hide`]: !showIcon,
          [`${prefixCls}-block-node`]: blockNode,
          [`${prefixCls}-unselectable`]: !selectable
        },
        className
      )}
      checkable={checkable ? <span className={`${prefixCls}-checkbox-inner`} /> : checkable}
      prefixCls={prefixCls}
      switcherIcon={(nodeProps: TreeNodeProps) => renderSwitcherIcon(prefixCls, switcherIcon, showLine, nodeProps)}
    >
      {children}
    </RcTree>
  )
})
