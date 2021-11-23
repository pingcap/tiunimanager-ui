export function getFsUploadURL() {
  return '/fs/file/import/upload'
}

export function getFsDownloadURL(id: number) {
  return `/fs/file/export/download/${id}`
}
