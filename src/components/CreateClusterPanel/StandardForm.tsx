import { ReactNode } from 'react'
import { loadI18n } from '@i18n-macro'
import { RequestClusterCreate } from '@/api/model'
import { FormInstance } from '@ant-design/pro-form'

loadI18n()

export interface StandardFormProps {
  form: FormInstance

  additionalOptions?: ReactNode
  formClassName?: string

  onSubmit: (data: RequestClusterCreate) => void
  footerClassName?: string
}

export function StandardForm(_: StandardFormProps) {
  return <>Not Implemented Yet {JSON.stringify(_)}</>
}
