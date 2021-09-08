import { IframeHTMLAttributes } from 'react'

export type ExternalServiceProps = IframeHTMLAttributes<HTMLIFrameElement>

export function ExternalService({ style, ...attrs }: ExternalServiceProps) {
  return (
    <iframe
      width="100%"
      // fill page
      style={{
        height: 'calc(100vh - 36px)',
        marginBottom: -48,
      }}
      scrolling="auto"
      frameBorder="0"
      {...attrs}
    />
  )
}
