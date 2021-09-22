import { Button, Checkbox, Col, Form, message, Modal, Row, Select } from 'antd'
import { loadI18n, useI18n } from '@i18n-macro'
import { useEffect } from 'react'
import {
  useQueryClusterBackupStrategy,
  useUpdateClusterBackupStrategy,
} from '@/api/cluster'
import { errToMsg } from '@/utils/error'

loadI18n()

export interface SettingModalProps {
  clusterId: string
  visible: boolean
  close: () => void
}

const WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]

const PERIOD_OPTIONS = [
  `00:00-01:00`,
  `01:00-02:00`,
  `02:00-03:00`,
  `03:00-04:00`,
  `04:00-05:00`,
  `05:00-06:00`,
  `06:00-07:00`,
  `07:00-08:00`,
  `08:00-09:00`,
  `09:00-10:00`,
  `10:00-11:00`,
  `11:00-12:00`,
  `12:00-13:00`,
  `13:00-14:00`,
  `14:00-15:00`,
  `15:00-16:00`,
  `16:00-17:00`,
  `17:00-18:00`,
  `18:00-19:00`,
  `19:00-20:00`,
  `20:00-21:00`,
  `21:00-22:00`,
  `22:00-23:00`,
  `23:00-00:00`,
].map((p) => (
  <Select.Option key={p} value={p}>
    {p}
  </Select.Option>
))

export default function SettingModal({
  clusterId,
  visible,
  close,
}: SettingModalProps) {
  const { t } = useI18n()

  const { isLoading, data, isError, error, refetch } =
    useQueryClusterBackupStrategy({ id: clusterId })

  const updateBackupStrategy = useUpdateClusterBackupStrategy()

  const [form] = Form.useForm()

  const handleReset = () => {
    form.setFieldsValue({
      backupDate: data?.data.data?.backupDate?.split(',') || [],
      period: data?.data.data?.period || '00:00-01:00',
    })
  }

  const handleUpdate = () => {
    const value = form.getFieldsValue()
    updateBackupStrategy.mutateAsync(
      {
        clusterId: clusterId,
        strategy: {
          backupDate: value?.backupDate?.join(','),
          period: value?.period,
        },
      },
      {
        onSuccess() {
          message.success(t('update.success', { msg: clusterId }), 0.8)
          close()
          refetch()
        },
        onError(e: any) {
          message.error(t('update.fail', { msg: errToMsg(e) }))
        },
      }
    )
  }

  // set initial values
  useEffect(() => {
    if (!isLoading) handleReset()
  }, [isLoading])

  return (
    <Modal
      title={t('title')}
      visible={visible}
      onOk={() => close()}
      onCancel={() => close()}
      maskClosable={false}
      destroyOnClose={true}
      footer={
        <div>
          <Button onClick={handleReset}>{t('reset')}</Button>
          <Button onClick={handleUpdate} type="primary">
            {t('save')}
          </Button>
        </div>
      }
    >
      {isLoading ? (
        'Loading...'
      ) : isError ? (
        message.error(t('fetch.fail', { msg: errToMsg(error) }))
      ) : (
        <div>
          <Form form={form}>
            <Form.Item name="backupDate" label={t('form.backupDate')}>
              <Checkbox.Group>
                <Row>
                  {WEEK.map((day) => (
                    <Col key={day} span={6}>
                      <Checkbox value={day}>{t(`week.${day}`)}</Checkbox>
                    </Col>
                  ))}
                </Row>
              </Checkbox.Group>
            </Form.Item>
            <Form.Item name="period" label={t('form.period')}>
              <Select>{PERIOD_OPTIONS}</Select>
            </Form.Item>
          </Form>
        </div>
      )}
    </Modal>
  )
}
