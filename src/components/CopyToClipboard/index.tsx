import { CopyOutlined } from '@ant-design/icons'
import copyToClipboard from 'copy-to-clipboard'
import { message as _message, Tooltip } from 'antd'
import styles from './index.module.less'

export function CopyIconButton({
  text,
  message,
  tip,
}: {
  text: string
  message?: string
  tip?: string
}) {
  let dom = (
    <CopyOutlined
      className={styles.copyIcon}
      onClick={() => {
        copyToClipboard(text)
        message && _message.success(message)
      }}
    />
  )
  if (tip) dom = <Tooltip title={tip}>{dom}</Tooltip>
  return <a>{dom}</a>
}
