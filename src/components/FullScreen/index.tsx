/*
 * Copyright 2022 PingCAP
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
