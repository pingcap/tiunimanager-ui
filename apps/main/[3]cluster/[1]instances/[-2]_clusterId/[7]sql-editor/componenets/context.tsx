import React, { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'

import {
  getSqlEditorRowsSetting,
  getSqlEditorFiles,
  updateSqlEditorFile,
  createsSqlEditorSession,
  getAIUserSetting
} from 'dbaas/services'
import useStores from 'dbaas/stores/useStores'

import { SqlRes, SqlFile, UserSetting } from './types'

export const SqlEditorContext = React.createContext<any>(null)

export const SqlEditorProvider: React.FC = (props) => {
  const [sqlResultList, setSqlResultList] = useState<SqlRes[] | []>([])
  const [dbList, setDbList] = useState([])
  const [sqlLimit, setSqlLimit] = useState(500)
  const [systemShow, setSystemShow] = useState(false)
  const [editorSetting, setEditorSetting] = useState<UserSetting>({
    chat2query_init: false,
    is_privacy_allowed: false,
    privacy_box_count: 0
  })
  const [sqlFiles, setSqlFiles] = useState<SqlFile[]>([])
  const [editedSqlFile, setEditedSqlFile] = useState<SqlFile>({ id: -1, name: '' })
  const [databaseName, setDatabaseName] = useState('')
  const [isCreatingFile, setIsCreatingFile] = useState(false)
  const [editSqlTexts, setEditSqlTexts] = useState([])
  const [sideMenuAcitveIndex, setSideMenuAcitveIndex] = useState(1)
  const { id: clusterId } = useParams() as { id: string }
  const [queryLogsH, setQueryLogsH] = useState(120)

  const [isAIInit, setIsAIInit] = useState(true) // false: is the first time

  const editFileQueueTimer = useRef<ReturnType<typeof setTimeout>>()
  const editFileQueue = useRef<SqlFile[]>([])
  const [isFromImport, setIsFromImport] = useState(false)
  const [newGeneSql, setNewGeneSql] = useState('')
  const [isRunAll, setIsRunAll] = useState(false)
  const {
    store: { activeProjectId, tenantData, preloadedSQLEditor }
  } = useStores()

  useEffect(() => {
    getSettings()

    getUserSetting()

    runFileQueue()

    localStorage.setItem(
      'chat2queryDefaultData',
      JSON.stringify({
        database: preloadedSQLEditor?.db,
        table: preloadedSQLEditor?.table
      })
    )

    return () => {
      editFileQueueTimer && clearTimeout(editFileQueueTimer.current)
    }
  }, [])

  const getUserSetting = async () => {
    const res = await getAIUserSetting(tenantData.id, activeProjectId)
    if (!res || res.code !== 200) {
      return
    }
    const data = res.data || {}

    setIsAIInit(data.chat2query_init === undefined ? true : data.chat2query_init)
    setEditorSetting(data as UserSetting)
    // setIsAIInit(false)
  }

  const getSettings = async () => {
    const res = await getSqlEditorRowsSetting(tenantData.id, activeProjectId, clusterId)
    if (!res || res.code !== 200) {
      return
    }
    const data = res.data || {}
    setSqlLimit(data.limit || 500)
    setSystemShow(data.show_system_db_schema || false)
  }

  const runFileQueue = () => {
    editFileQueueTimer && clearTimeout(editFileQueueTimer.current)

    editFileQueueTimer.current = setTimeout(async () => {
      const list = editFileQueue.current || []
      if (list.length) {
        await updateSqlEditorFile(tenantData.id, activeProjectId, clusterId, list[0].id, list[0])
        list.shift()
        editFileQueue.current = list
      }
    }, 500)
  }

  const getSqlFiles = async (needMatch: boolean, selectedFile?: SqlFile) => {
    const res = await getSqlEditorFiles(tenantData.id, activeProjectId, clusterId)
    if (res.code !== 200) {
      return
    }

    const list = res.data || []
    setSqlFiles(list as SqlFile[])

    if (selectedFile) {
      setEditedSqlFile(selectedFile)
      return
    }

    if (!needMatch) {
      return
    }

    list.forEach((file: SqlFile) => {
      if (file.id === editedSqlFile?.id) {
        setEditedSqlFile(file)
      }
    })
  }

  const createSession = async (fileId: number, database: string) => {
    const res = await createsSqlEditorSession(tenantData.id, activeProjectId, clusterId, {
      database
    })

    sqlFiles.forEach((item) => {
      if (item.id === fileId) {
        item.sessionId = res.data
      }
    })

    setSqlFiles(sqlFiles)

    if (editedSqlFile.id === fileId) {
      setEditedSqlFile({
        ...editedSqlFile,
        sessionId: res.data
      })
    }
  }

  return (
    <SqlEditorContext.Provider
      value={{
        clusterId,
        orgId: tenantData.id,
        projectId: activeProjectId,
        sqlResultList,
        setSqlResultList,
        dbList,
        setDbList,
        sqlLimit,
        setSqlLimit,
        systemShow,
        setSystemShow,
        editorSetting,
        setEditorSetting,
        isAIInit,
        setIsAIInit,
        sqlFiles,
        setSqlFiles,
        editedSqlFile,
        setEditedSqlFile,
        getSqlFiles,
        databaseName,
        setDatabaseName,
        isCreatingFile,
        setIsCreatingFile,
        editSqlTexts,
        setEditSqlTexts,
        sideMenuAcitveIndex,
        setSideMenuAcitveIndex,
        editFileQueue,
        queryLogsH,
        setQueryLogsH,
        createSession,
        isFromImport,
        setIsFromImport,
        newGeneSql,
        setNewGeneSql,
        setIsRunAll,
        isRunAll
      }}
    >
      {props.children}
    </SqlEditorContext.Provider>
  )
}
