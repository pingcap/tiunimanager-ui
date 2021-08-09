import { Form } from 'antd'
import { loadI18n, useI18n } from '@i18n-macro'
import { FormInstance } from 'antd/lib/form/hooks/useForm'
import { FormProps } from 'antd/lib/form/Form'
import { ReactNode, Ref } from 'react'

loadI18n()

export default function IntlForm<Values = any>(
  props: FormProps<Values> & { children?: ReactNode } & {
    ref?: Ref<FormInstance<Values>>
  }
) {
  const { t } = useI18n()
  return (
    <Form
      validateMessages={{
        required: t('validation.required'),
      }}
      {...props}
    />
  )
}
