import {
  Button,
  Card,
  Divider,
  Form,
  List,
  message,
  Modal,
  Select,
  TimePicker,
} from 'antd'
import { loadI18n, useI18n } from '@i18n-macro'
import { useCallback, useEffect, useMemo, useState } from 'react'
import parser from 'cron-parser'
import {
  useQueryClusterBackupStrategy,
  useUpdateClusterBackupStrategy,
} from '@/api/cluster'
import { errToMsg } from '@/utils/error'
import styles from './index.module.less'

loadI18n()

export interface SettingModalProps {
  clusterId: string
  visible: boolean
  close: () => void
}

const WEEK = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']

export default function SettingModal({
  clusterId,
  visible,
  close,
}: SettingModalProps) {
  const { t, i18n } = useI18n()

  const [cron, setCron] = useState('0 1 * * *')

  const { isLoading, data, isError, error, refetch } =
    useQueryClusterBackupStrategy({ id: clusterId })

  const updateBackupStrategy = useUpdateClusterBackupStrategy()
  const handleUpdate = useCallback(
    (value) => {
      updateBackupStrategy.mutateAsync(
        {
          clusterId: clusterId,
          // cronString: value,
        },
        {
          onSuccess(data) {
            refetch()
            message.success(t('update.success', { msg: clusterId }), 0.8)
            close()
          },
          onError(e: any) {
            message.error(
              t('update.fail', {
                msg: errToMsg(e),
              })
            )
          },
        }
      )
    },
    [clusterId, updateBackupStrategy.mutateAsync, refetch, close, i18n.language]
  )

  useEffect(() => {
    if (isLoading) return
    if (isError) message.error(t('fetch.fail', { msg: errToMsg(error) }))
    // else setCron(data!.data.data![0].cronString!)
  }, [isLoading, data])

  const nextTimes = useMemo(() => {
    try {
      const parsed = parser.parseExpression(cron)
      return Array.from(
        {
          length: 5,
        },
        () => new Date(parsed.next().toISOString()).toLocaleString('en')
      )
    } catch (e) {
      return []
    }
  }, [cron])

  const dom = useMemo(() => {
    return (
      <div>
        <Form>
          <Form.Item name="period" label={t('form.period')}>
            <Select mode="multiple" allowClear>
              {WEEK.map((day) => (
                <Select.Option key={day} value={day}>
                  {t(`week.${day}`)}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="time" label={t('form.time')}>
            <TimePicker allowClear={false} />
          </Form.Item>
        </Form>
        <Divider />
        <div className={styles.preview}>
          <h4> {t('preview')}</h4>
          <List
            size="small"
            dataSource={nextTimes}
            className={styles.previewList}
            renderItem={(item) => <p>{item}</p>}
          />
        </div>
      </div>
    )
  }, [i18n.language, nextTimes])

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
          <Button
            onClick={() => {
              setCron(origin)
            }}
          >
            {t('reset')}
          </Button>
          <Button onClick={handleUpdate} type="primary">
            {t('save')}
          </Button>
        </div>
      }
    >
      {dom}
    </Modal>
  )
}
