import { FullscreenExitOutlined, FullscreenOutlined } from '@ant-design/icons'
import { loadI18n, useI18n } from '@i18n-macro'
import { Tooltip } from 'antd'
import { MutableRefObject, useCallback, useEffect, useState } from 'react'

loadI18n()

export type FullScreenProps = {
  domRef: MutableRefObject<HTMLDivElement | null>
}

export function FullScreen({ domRef }: FullScreenProps) {
  const { t } = useI18n()
  const [fullscreen, setFullscreen] = useState(false)
  useEffect(() => {
    document.onfullscreenchange = () => {
      setFullscreen(!!document.fullscreenElement)
    }
  }, [])
  const toggleFullscreen = useCallback(() => {
    if (!domRef.current || !document.fullscreenEnabled) {
      return
    }
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      domRef.current.requestFullscreen()
    }
  }, [domRef])
  const Icon = fullscreen ? FullscreenExitOutlined : FullscreenOutlined
  return (
    <Tooltip title={fullscreen ? t('exit') : t('enter')}>
      <Icon onClick={toggleFullscreen} />
    </Tooltip>
  )
}
