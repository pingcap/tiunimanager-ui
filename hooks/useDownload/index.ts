import { axiosInstance } from '@/api/client'
import { message } from 'antd'
import { getI18n, loadI18n } from '@i18n-macro'

loadI18n()

export async function useDownload(url: string, defaultFilename?: string) {
  const t = getI18n()

  const res = await fetch(url, {
    method: 'GET',
    headers: axiosInstance.defaults.headers,
  })

  if (!res.ok) {
    message.error(t('error') + (await res.text()))
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
