import { fsBasePath } from '@/api/client'

export function getFsUploadURL() {
  return `/fs${fsBasePath}/file/import/upload`
}

export function getFsDownloadURL(id: string) {
  return `/fs${fsBasePath}/file/export/download/${id}`
}
