/*
 * Copyright 2022 PingCAP, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  Button,
  Checkbox,
  Col,
  Form,
  Modal,
  Row,
  Select,
  Space,
  Tooltip,
} from 'antd'
import { loadI18n, useI18n } from '@i18n-macro'
import { useEffect, useState } from 'react'
import {
  useQueryClusterBackupStrategy,
  useUpdateClusterBackupStrategy,
} from '@/api/hooks/cluster'

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

  const { isLoading, data, refetch } = useQueryClusterBackupStrategy({
    id: clusterId,
  })

  const strategy = data?.data.data?.strategy

  const updateBackupStrategy = useUpdateClusterBackupStrategy()

  const [form] = Form.useForm()

  const handleReset = () => {
    if (strategy?.backupDate) {
      form.setFieldsValue({
        backupDate: strategy?.backupDate?.split(',') || [],
        period: strategy?.period || '00:00-01:00',
      })
    } else {
      form.setFieldsValue({
        backupDate: [],
        period: '00:00-01:00',
      })
    }
  }

  const handleUpdate = async () => {
    const value = await form.validateFields()
    await updateBackupStrategy.mutateAsync(
      {
        payload: {
          clusterId: clusterId,
          strategy: {
            backupDate: value?.backupDate?.join(','),
            period: value?.period,
          },
        },
        options: {
          successMessage: t('update.message.success'),
          errorMessage: t('update.message.failed'),
        },
      },
      {
        onSuccess() {
          close()
          refetch()
        },
      }
    )
  }

  // set initial values
  useEffect(() => {
    if (!isLoading) handleReset()
  }, [isLoading])

  const [changed, setChanged] = useState(false)

  return (
    <Modal
      title={t('title')}
      visible={visible}
      onOk={() => close()}
      onCancel={() => close()}
      maskClosable={false}
      destroyOnClose={true}
      footer={
        changed ? (
          <Space>
            <Button onClick={handleReset}>{t('reset')}</Button>
            <Button onClick={handleUpdate} type="primary">
              {t('save')}
            </Button>
          </Space>
        ) : (
          <Space>
            <Button disabled>{t('reset')}</Button>
            <Tooltip title={t('noChanges')}>
              <Button type="primary" disabled>
                {t('save')}
              </Button>
            </Tooltip>
          </Space>
        )
      }
    >
      {isLoading ? (
        'Loading...'
      ) : (
        <div>
          <Form
            form={form}
            onValuesChange={(v: { backupDate?: string[]; period?: string }) => {
              if (!strategy) return false
              let diff = false
              if (
                v?.backupDate &&
                v?.backupDate?.sort().join(',') !==
                  strategy.backupDate?.split(',').sort().join(',')
              )
                diff = true
              if (v?.period && v?.period !== strategy.period) diff = true
              setChanged(diff)
            }}
          >
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
