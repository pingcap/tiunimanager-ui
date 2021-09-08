import { axiosInstance } from '@/api/client'
import { message } from 'antd'
import i18next from 'i18next'

const errorMessage: Record<string, string> = {
  zh: `下载文件失败: `,
  en: `Fail to download file: `,
}

export function useDownload(url: string, filename: string) {
  fetch(url, {
    method: 'GET',
    headers: axiosInstance.defaults.headers,
  })
    .then((res) => {
      if (res.ok) return res.blob()
      throw res.text()
    })
    .then((data) => {
      const blobUrl = window.URL.createObjectURL(data)
      const a = document.createElement('a')
      a.download = filename
      a.href = blobUrl
      a.click()
    })
    .catch(async (msg) => {
      message.error(errorMessage[i18next.language] + (await msg))
    })
}
