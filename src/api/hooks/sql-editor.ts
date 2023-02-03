import { axiosInstance } from '../client'

interface Res {
  code?: number
  data?: any
  message?: string
}

////////////////////

// export function getAIUserSetting(payload: { clusterId: string }) {
//   return axiosInstance
//     .get<Res>(`/api/v1/dataapps/sqleditor/${payload.clusterId}/users`)
//     .then((res) => res.data)
// }

// export function getSqlEditorRowsSetting(payload: { clusterId: string }) {
//   return axiosInstance
//     .get<Res>(`/api/v1/dataapps/sqleditor/${payload.clusterId}/settings`)
//     .then((res) => res.data)
// }

export function getSqlEditorFiles(payload: { clusterId: string }) {
  return axiosInstance
    .get<Res>(`/api/v1/dataapps/sqleditor/${payload.clusterId}/sqlfiles`)
    .then((res) => res.data)
    .then((d) => {
      return { ...d, data: d.data.list }
    })
}

export function createSqlEditorFile(payload: { clusterId: string; body: any }) {
  return axiosInstance
    .post<Res>(
      `/api/v1/dataapps/sqleditor/${payload.clusterId}/sqlfiles`,
      {
        ...payload.body,
        // database: 'test',
      },
      { skipSuccessNotification: true }
    )
    .then((res) => res.data)
    .then((d) => {
      return {
        ...d,
        data: d.data.id,
      }
    })
}

export function deleteSqlEditorFile(payload: {
  clusterId: string
  sqlFileId: number
}) {
  return axiosInstance
    .delete<Res>(
      `/api/v1/dataapps/sqleditor/${payload.clusterId}/sqlfiles/${payload.sqlFileId}`
    )
    .then((res) => res.data)
}

export function updateSqlEditorFile(payload: {
  clusterId: string
  sqlFileId: number
  body: any
}) {
  return axiosInstance
    .put<Res>(
      `/api/v1/dataapps/sqleditor/${payload.clusterId}/sqlfiles/${payload.sqlFileId}`,
      payload.body,
      { skipSuccessNotification: true }
    )
    .then((res) => res.data)
}

/////////////////////

export function getAllDbData(payload: { clusterId: string; params: any }) {
  return axiosInstance
    .get<Res>(
      `/api/v1/dataapps/sqleditor/${payload.clusterId}/meta?isbrief=${payload.params.isbrief}`
    )
    .then((res) => res.data)
}

export function getDbMeta(payload: {
  clusterId: string
  dbName: string
  tableName: string
}) {
  return axiosInstance
    .get<Res>(
      `/api/v1/dataapps/sqleditor/${payload.clusterId}/dbs/${payload.dbName}/${payload.tableName}/meta`
    )
    .then((res) => res.data)
}

//////////

export function createsSqlEditorSession(payload: {
  clusterId: string
  body: any
}) {
  return axiosInstance
    .post<Res>(
      `/api/v1/dataapps/sqleditor/${payload.clusterId}/session`,
      payload.body,
      { skipSuccessNotification: true }
    )
    .then((res) => res.data)
    .then((d) => {
      return {
        ...d,
        data: d.data.sessionID,
      }
    })
}

export function sqlEditorSQLExecute(payload: { clusterId: string; body: any }) {
  return axiosInstance
    .post<Res>(
      `/api/v1/dataapps/sqleditor/${payload.clusterId}/statements`,
      payload.body,
      { skipSuccessNotification: true }
    )
    .then((res) => res.data)
    .then((d) => {
      return {
        ...d,
        data: d.data.data,
      }
    })
}
