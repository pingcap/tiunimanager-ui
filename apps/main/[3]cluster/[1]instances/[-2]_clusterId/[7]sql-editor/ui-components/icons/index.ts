// import React from 'react'

import { createElement, SVGProps } from 'react'

import { ICON_MAP } from './raw'

export type IconProps = {
  name: keyof typeof ICON_MAP
  size?: number
} & SVGProps<SVGSVGElement>

export const Icon: React.FC<IconProps> = ({ name, size, ...restProps }) => {
  return createElement(ICON_MAP[name], {
    ...restProps,
    ...(typeof size !== 'undefined' ? { height: size, width: size } : {})
  })
}
