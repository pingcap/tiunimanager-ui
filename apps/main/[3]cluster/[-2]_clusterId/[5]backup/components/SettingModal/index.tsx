import { Button, Card, List, message, Modal } from 'antd'
import { loadI18n, useI18n } from '@i18n-macro'
import { useCallback, useEffect, useMemo, useState } from 'react'
import parser from 'cron-parser'
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

export default function SettingModal({
  clusterId,
  visible,
  close,
}: SettingModalProps) {
  const { t, i18n } = useI18n()

  const [cron, setCron] = useState('* * * * *')

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
            message.success(
              t('update.success' /* { msg: data.data.data!.cronString }*/),
              0.8
            )
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
        <Card bordered={false}>
          {/*<CronInput value={cron} setValue={setCron} lang={'zh'} />*/}
        </Card>
        <Card bordered={false} title={t('preview')}>
          <List
            size="small"
            dataSource={nextTimes}
            style={{ fontSize: 16 }}
            renderItem={(item) => <p>{item}</p>}
          />
        </Card>
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
