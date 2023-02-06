export type SqlRes = {
  status: RequestStatus
  sql: string
  res?: SqlFetchRes
}

export enum RequestStatus {
  Loading = 'loading',
  Success = 'success',
  Error = 'error',
  Waiting = 'waiting',
}

export type SqlFetchRes = {
  columns: any
  details: any
  code?: number
  message?: string
  stats?: string
  execute_time: string
  row_count?: number
}

export type SqlFile = {
  id: number
  name: string
  createdBy?: string
  database?: string
  content?: string
  sessionId?: string
}

export type UserSetting = {
  chat2query_init: boolean
  is_privacy_allowed: boolean
  privacy_box_count: number
}
