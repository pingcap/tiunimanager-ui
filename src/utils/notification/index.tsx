import { Button, notification } from 'antd'
import { getI18n, loadI18n } from '@i18n-macro'

loadI18n()

export type TaskCreatedContent = {
  toDetail?: () => unknown
  taskID: number
  taskName: string
  duration?: number
}

export function showAsyncTaskCreatedNotification({
  toDetail,
  taskID,
  taskName,
  duration = 10,
}: TaskCreatedContent) {
  const key = `open${Date.now()}`
  const t = getI18n()
  notification.success({
    key,
    duration,
    message: t('title', {
      taskName,
    }),
    description: t('description', {
      taskID,
    }),
    btn: toDetail && (
      <Button
        type="primary"
        onClick={() => {
          toDetail()
          notification.close(key)
        }}
      >
        {t('link')}
      </Button>
    ),
  })
}
