/*
 * Copyright 2022 PingCAP, Inc.
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
