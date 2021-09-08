import moment from 'moment'

export function formatTimeString(raw: string, format = 'YYYY-MM-DD HH:mm:ss') {
  return moment(raw).format(format)
}

export function getTimestamp(raw: string) {
  return moment(raw).unix()
}
