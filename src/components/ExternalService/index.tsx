import { IframeHTMLAttributes } from 'react'

export type ExternalServiceProps = IframeHTMLAttributes<HTMLIFrameElement>

export function ExternalService({ style, ...props }: ExternalServiceProps) {
  console.log(props, style)
  return (
    <iframe
      width="100%"
      // fill page
      style={{
        height: 'calc(100vh - 36px)',
        marginBottom: -48,
        ...style,
      }}
      scrolling="auto"
      frameBorder="0"
      {...props}
    />
  )
}
