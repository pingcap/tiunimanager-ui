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

import { axiosInstance } from '@/api/client'
import { message } from 'antd'
import i18next from 'i18next'

const errorMessage: Record<string, string> = {
  zh: `下载文件失败: `,
  en: `Fail to download file: `,
}

export async function useDownload(url: string, defaultFilename?: string) {
  const res = await fetch(url, {
    method: 'GET',
    headers: axiosInstance.defaults.headers,
  })

  if (!res.ok) {
    message.error(errorMessage[i18next.language] + (await res.text()))
    return
  }
  const blobUrl = window.URL.createObjectURL(await res.blob())
  const a = document.createElement('a')
  a.download =
    res.headers.get('Content-Disposition')?.match(/filename=(.+)$/)?.[1] ||
    defaultFilename ||
    'download_file'
  a.href = blobUrl
  a.click()
}
