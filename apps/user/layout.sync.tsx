import { PropsWithChildren } from 'react'
import BlankLayout from './layouts'

export default function ({ children }: PropsWithChildren<{}>) {
  return <BlankLayout>{children}</BlankLayout>
}
