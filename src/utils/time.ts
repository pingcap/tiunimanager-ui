import moment from 'moment'

export function formatTimeString(raw: string, format = 'YYYY-MM-DD HH:mm:ss') {
  return moment(raw).format(format)
}
