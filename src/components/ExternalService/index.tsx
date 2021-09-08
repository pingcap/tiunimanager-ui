import { IframeHTMLAttributes } from 'react'

export type ExternalServiceProps = IframeHTMLAttributes<HTMLIFrameElement> & {
  mode?: 'card' | 'page'
}

const styles = {
  card: {
    height: 'calc(100vh - 36px)',
    marginBottom: 0,
    marginTop: -24,
    border: '1px solid #f0f0f0',
  },
  page: {
    height: 'calc(100vh - 36px)',
    marginBottom: -48,
  },
} as const

export function ExternalService({
  style,
  mode = 'page',
  ...props
}: ExternalServiceProps) {
  return (
    <iframe
      width="100%"
      // fill page
      style={{
        ...styles[mode],
        ...style,
      }}
      scrolling="auto"
      frameBorder="0"
      {...props}
    />
  )
}
