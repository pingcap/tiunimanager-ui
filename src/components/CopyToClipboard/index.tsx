import { CopyOutlined } from '@ant-design/icons'
import copyToClipboard from 'copy-to-clipboard'
import { message as _message, Tooltip } from 'antd'

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
      onClick={() => {
        copyToClipboard(text)
        message && _message.success(message)
      }}
    />
  )
  if (tip) dom = <Tooltip title={tip}>{dom}</Tooltip>
  return <a>{dom}</a>
}
