import { message } from 'antd'
import { IframeHTMLAttributes, MutableRefObject, Ref, useState } from 'react'
import { loadI18n, useI18n } from '@i18n-macro'

loadI18n()

export interface EmbedDashboardProps
  extends IframeHTMLAttributes<HTMLIFrameElement> {
  iframeRef?: Ref<HTMLIFrameElement>
  token: string
  // redirectPath: DashboardPages
  path: DashboardPages
  url: string
}

export type DashboardPages =
  | '/statement'
  | '/slow_query'
  | '/keyviz'
  | '/diagnose'

export function EmbedDashboard({
  token,
  url,
  path,
  iframeRef,
  ...attr
}: EmbedDashboardProps) {
  const portalUrl = `${url}#/portal`
  const pageUrl = `${url}#${path}`
  const { t, i18n } = useI18n()
  const [loaded, setLoaded] = useState(false)

  return (
    <iframe
      id="dashboard"
      ref={iframeRef}
      width="100%"
      scrolling="no"
      frameBorder="0"
      src={loaded ? pageUrl : portalUrl}
      {...attr}
      onLoad={(e) => {
        if (!(e.target as HTMLIFrameElement).contentWindow)
          message.error(t('load.fail'))
        else {
          ;(e.target as HTMLIFrameElement).contentWindow?.postMessage(
            {
              type: 'DASHBOARD_PORTAL_EVENT',
              lang: i18n.language,
              hideNav: true,
              token,
              redirectPath: path,
            },
            '*'
          )
          setLoaded(true)
        }
      }}
    />
  )
}
