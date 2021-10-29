import { useI18n } from '@i18n-macro'
import { Form, Input } from 'antd'

export default function () {
  const { t } = useI18n()
  // return <>{t('name')}</>
  return (
    <Form>
      <Form.Item
        label={t('restore-info.fields.clusterId')}
        tooltip={t('restore-info.tips.not-editable')}
      >
        <Input />
      </Form.Item>
      <Form.Item
        label={t('restore-info.fields.clusterName')}
        tooltip={t('restore-info.tips.not-editable')}
      >
        <Input />
      </Form.Item>
      <Form.Item
        label={t('restore-info.fields.backupId')}
        tooltip={t('restore-info.tips.not-editable')}
      >
        <Input />
      </Form.Item>
      <Form.Item
        label={t('restore-info.fields.backupPath')}
        tooltip={t('restore-info.tips.not-editable')}
      >
        <Input />
      </Form.Item>
    </Form>
  )
}
