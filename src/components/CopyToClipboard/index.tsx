import { CopyOutlined } from '@ant-design/icons'
import copyToClipboard from 'copy-to-clipboard'
import { message, Tooltip } from 'antd'
import styles from './index.module.less'
import { loadI18n, useI18n } from '@i18n-macro'

loadI18n()

export function CopyIconButton({
  text,
  label,
  float = true,
}: {
  text: string
  label: string
  float?: boolean
}) {
  const { t } = useI18n()
  const className = float
    ? `${styles.copyIcon} ${styles.float}`
    : styles.copyIcon
  return (
    <Tooltip title={t('tip', { label })}>
      <CopyOutlined
        className={className}
        onClick={() => {
          copyToClipboard(text)
          message.success(
            t('success', {
              label,
              text,
            })
          )
        }}
      />
    </Tooltip>
  )
}
