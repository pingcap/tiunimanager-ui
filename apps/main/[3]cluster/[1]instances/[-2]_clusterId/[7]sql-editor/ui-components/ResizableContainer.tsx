import React, { FC } from 'react'
import { Resizable, ResizableProps } from 're-resizable'

const ResizableContainer: FC<ResizableProps> = ({ children, ...props }) => {
  return <Resizable {...props}>{children}</Resizable>
}

export default ResizableContainer
