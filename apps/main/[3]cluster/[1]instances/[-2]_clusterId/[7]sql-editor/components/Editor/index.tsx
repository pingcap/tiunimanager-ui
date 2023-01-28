import { EditorState } from '@codemirror/state'
import { Switch } from '@mantine/core'
import { Loader } from '@mantine/core'
import { Settings01, PlusSquare, DotsHorizontal, RunFill, XClose, AiExplore01 } from '@tidb-cloud-uikit/icons/raw'
import functions from '@tidb-cloud-uikit/icons/raw/CodeCircle03.svg'
import database from '@tidb-cloud-uikit/icons/raw/Database.svg'
import tableSvg from '@tidb-cloud-uikit/icons/raw/DatabseTable.svg'
import keyword from '@tidb-cloud-uikit/icons/raw/Key02.svg'
import typesSvg from '@tidb-cloud-uikit/icons/raw/Types02.svg'
import variable from '@tidb-cloud-uikit/icons/raw/Variable.svg'
import { Button, Dropdown, Modal, Popup } from '@tidb-cloud/ui-components'
import CodeMirror from '@uiw/react-codemirror'
import { useMount } from 'ahooks'
import { observer } from 'mobx-react'
import { useEffect, useState, useContext, useRef } from 'react'
import React from 'react'

import { Form, FormSelect, FormCheckbox } from 'dbaas/components/Form'
import {
  sqlEditorSQLExecute,
  sqlEditorRowsSetting,
  createSqlEditorFile,
  updateSqlEditorFile,
  generateSqlByBot,
  updateAIUserSetting,
  getSqlEditorRowsSetting
} from 'dbaas/services'
import { getErrorMessage } from 'dbaas/services/errorCodes'
import useStores from 'dbaas/stores/useStores'
import { eventTracking } from 'dbaas/utils/tracking'

import { autocompletion, Completion } from '../Autocomplete'
import { SqlEditorContext } from '../context'
import { sql, MySQL } from '../Sql'
import defautFileContent, { newFileContent } from '../SqlFiles/fileContent'
import strip from '../StripComments'
import { RequestStatus, SqlFile, UserSetting } from '../types'

import styles from './index.module.less'
import { bbedit } from './theme'

const Editor = (props: { onRun: () => void }) => {
  const [extensions, setExtensions] = useState<any>([sql()])
  const [isRunning, setIsRunning] = useState(false)
  const saveSqlTimer = useRef<ReturnType<typeof setTimeout>>()
  const isSqlInit = useRef(true)
  const sqlTextRef = useRef('')
  const [sqlText, setSqlText] = useState('')
  const fileRef = useRef<SqlFile | null>(null)
  const sqlFilesRef = useRef<SqlFile[]>([])
  const root = useRef<HTMLDivElement>(null)
  const [aiTipsPos, setAiTipsPos] = useState({
    start: -1,
    len: -1,
    isGeneTip: false
  })
  const aiStartRef = useRef(-1)
  const aiTipStartRef = useRef(-1)
  const aiTipLenRef = useRef(-1)
  const isGeneTipRef = useRef(false)
  const [aiLoadingIndex, setAiLoadingIndex] = useState(-1)
  const [curAiSql, setCurAiSql] = useState('')
  const cursorPosRef = useRef(0)
  const cursorPosingRef = useRef(0)
  const aiTips = 'AI is generating SQL (type to cancel)'
  const aiTipNumRef = useRef(0)
  const aiTipsTimerRef = useRef<number | null>(null)
  const viewUpdateRef = useRef<any>(null)
  const editorSettingRef = useRef<UserSetting | null>(null)
  const isAIInitRef = useRef(true)
  const [isPrivacyAllow, setIsPrivacyAllow] = useState(false)
  const [isAggVisible, setIsAggVisible] = useState(false)

  const {
    orgId,
    projectId,
    clusterId,
    setSqlResultList,
    sqlFiles,
    setSqlFiles,
    editorSetting,
    setEditorSetting,
    dbList,
    databaseName,
    editedSqlFile,
    setEditedSqlFile,
    isAIInit,
    setIsAIInit,
    getSqlFiles,
    isCreatingFile,
    setIsCreatingFile,
    setEditSqlTexts,
    setSideMenuAcitveIndex,
    createSession,
    setIsFromImport,
    isFromImport,
    newGeneSql,
    setNewGeneSql,
    isRunAll,
    setIsRunAll
  } = useContext(SqlEditorContext)
  const sectionTextRef = useRef('')

  const {
    store: {
      config: { enableSQLEditorAI, enableSQLEditorAIDB }
    }
  } = useStores()

  useEffect(() => {
    editorSettingRef.current = editorSetting
    setIsPrivacyAllow(editorSetting.is_privacy_allowed)

    if (!isAIInitRef.current) {
      userAggreementModal()
      return
    }
  }, [editorSetting])

  useEffect(() => {
    isAIInitRef.current = isAIInit
  }, [isAIInit])

  useEffect(() => {
    saveSqlAuto()

    return () => {
      saveSqlTimer && clearTimeout(saveSqlTimer.current)
      window.removeEventListener('keydown', keydownHandler, true)
    }
  }, [])

  useEffect(() => {
    fileRef.current = editedSqlFile
  }, [editedSqlFile])

  useEffect(() => {
    if (editedSqlFile.id === -1) {
      return
    }

    sqlTextRef.current = editedSqlFile?.content || ''
    setSqlText(editedSqlFile?.content || '')

    if (!editedSqlFile.sessionId) {
      fileChangeHandler(editedSqlFile.id, editedSqlFile.database || '')
    }

    if (viewUpdateRef.current) {
      viewUpdateRef.current.view.focus()
    }

    // run sql after create session
    if (isFromImport && editedSqlFile.sessionId) {
      setIsFromImport(false)
      runSqlHandler(true, editedSqlFile.sessionId)
    } else if (isRunAll) {
      setIsRunAll(false)
      runSqlHandler(true, editedSqlFile.sessionId)
    }
  }, [editedSqlFile.id, editedSqlFile.sessionId])

  useEffect(() => {
    fileRef.current = editedSqlFile
  }, [editedSqlFile])

  useEffect(() => {
    initCusor()
  }, [sqlText])

  useEffect(() => {
    sqlFilesRef.current = sqlFiles
  }, [sqlFiles])

  useMount(() => {
    window.addEventListener('keydown', keydownHandler, true)
  })

  useEffect(() => {
    const defaultData = {}
    const tables: { label: string; type: string }[] = []

    dbList.map((database: any) => {
      defaultData[database.name] = database.children.map((table: any) => {
        if (databaseName === database.name) {
          tables.push({
            label: table.name,
            type: 'table'
          })
        }

        return {
          label: table.name,
          type: 'table'
        }
      })
    })

    setExtensions([
      sql({
        dialect: MySQL,
        schema: defaultData,
        tables: dbList
          .map((db: any) => {
            return {
              label: db.name,
              type: 'database'
            }
          })
          .concat(tables),
        upperCaseKeywords: true
      }),
      autocompletion({
        activateOnTyping: true,
        closeOnBlur: false,
        optionClass: () => 'auto-item',
        icons: false,
        addToOptions: [
          {
            render: (completion: Completion, state: EditorState) => {
              let src = ''
              //  `class`, `constant`, `enum`,
              // `interface`, `namespace`,
              // `property`, `text`

              switch (completion.type) {
                case 'keyword':
                  src = keyword
                  break
                case 'variable':
                  src = variable
                  break
                case 'type':
                  src = typesSvg
                  break
                case 'function':
                case 'method':
                  src = functions
                  break
                case 'table':
                  src = tableSvg
                  break
                case 'database':
                  src = database
                  break
              }

              // const map = {
              //   'keyword': <Keyword width={14} height={14} />,
              //   'variable': <Variable />,
              //   'type': <Types />,
              //   'function': <Functions />,
              //   'method': <Functions />,
              //   'table': <Table />,
              //   'database': <Database />
              // }

              if (src) {
                const element = document.createElement('img')
                element.src = src
                return element
              } else {
                return null
              }
            },
            position: 0
          }
        ]
      })
    ])
  }, [dbList, databaseName])

  useEffect(() => {
    if (!newGeneSql) {
      return
    }
    const arrs = sqlTextRef.current.split('\n')
    const lineNum = getLineNumByPos(cursorPosingRef.current, arrs)
    const prefix = arrs.slice(0, lineNum)
    const affix = arrs.slice(lineNum)
    const newText = prefix.concat([newGeneSql]).concat(affix).join('\n')

    setSqlText(newText)
    sqlTextRef.current = newText
    setNewGeneSql('')
  }, [newGeneSql])

  // change the cursor when file changed
  const initCusor = () => {
    if (!viewUpdateRef.current) {
      return
    }

    const content = sqlTextRef.current || ''
    if (content === defautFileContent) {
      let len = 0
      const arrs = content.split('\n')
      for (let i = 0; i < arrs.length; i++) {
        if (arrs[i] === '') {
          break
        }
        len += arrs[i].length + 1
      }
      len = Math.min(len, defautFileContent.length)
      setCursor(len, viewUpdateRef.current, true)
    } else if (content === newFileContent) {
      const arrs = content.split('\n')
      const len = arrs[0].length + arrs[1].length + arrs[2].length + 2
      setCursor(len, viewUpdateRef.current, true)
    }
  }

  const fileChangeHandler = async (id: number, database: string) => {
    await createSession(id, database || '')
  }

  const keydownHandler = (e: KeyboardEvent) => {
    if (isCompositionKey(e) || isRunAllCompositionKey(e)) {
      e.preventDefault()
      let isAll = true

      if (isRunAllCompositionKey(e)) {
        runSqlHandler(true, fileRef.current?.sessionId)
      } else {
        runSqlHandler(false, fileRef.current?.sessionId)
        isAll = false
      }

      eventTracking('SQL Editor Executed', {
        source: 'Hot Key',
        key: isAll ? 'run all' : 'run single line'
      })
    }
  }

  const isCompositionKey = (e: KeyboardEvent) => {
    return (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'enter'
  }

  const isRunAllCompositionKey = (e: KeyboardEvent) => {
    return (e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'enter'
  }

  const saveSqlAuto = () => {
    saveSqlTimer.current && clearTimeout(saveSqlTimer.current)

    saveSqlTimer.current = setTimeout(async () => {
      saveSqlAuto()

      if (!fileRef.current || fileRef.current.id === -1) {
        return
      }

      const data = {
        ...fileRef.current,
        content: sqlTextRef.current
      }

      await updateSqlEditorFile(orgId, projectId, clusterId, fileRef.current.id, data)
      if (fileRef.current.id === data.id) {
        setEditedSqlFile(data)
        fileRef.current = data
      }

      const list = sqlFilesRef.current
      list.forEach((file: SqlFile) => {
        if (file.id === data.id) {
          file.content = data.content
          file.database = data.database
        }
      })
      setSqlFiles(list)
    }, 5000)
  }

  const editorKeyDownHandler = (e: React.KeyboardEvent) => {
    let key = ''
    let type = 'Accept'
    const tipsStart = aiTipStartRef.current
    const start = aiStartRef.current
    const isGeneTip = isGeneTipRef.current

    if (e.code !== 'Tab') {
      if (e.code === 'Enter' && start !== -1 && isGeneTip) {
        return
      }

      if (tipsStart === -1) {
        return
      }

      e.preventDefault()
      const text = sqlTextRef.current.split('\n')

      text.splice(aiTipsPos.start - 1, e.code === 'Enter' ? aiTipsPos.len + 1 : aiTipsPos.len)
      text.splice(aiTipsPos.start - 1, 0, ' ')
      const content = text.join('\n')
      sqlTextRef.current = content
      setSqlText(content)
      setTimeout(() => {
        setCursor(text.slice(0, start - 1).join('\n').length + 1, viewUpdateRef.current)
        updateAiTipsPosInfo(-1, -1, false)
      }, 0)
      key = e.code === 'Escape' ? 'Escape' : 'Others'
      type = 'Reject'
    } else {
      const isGeneTip = isGeneTipRef.current

      if (start !== -1 && !isGeneTip) {
        key = 'Tab'
        updateAiTipsPosInfo(-1, -1, false)
      }
    }

    if (key) {
      eventTracking(`SQL Editor ${type} AI Result`, {
        key,
        question: curAiSql
      })
    }
  }

  const changeHandler = React.useCallback(async (sql: string, viewUpdate) => {
    // console.log('change', viewUpdate)
    viewUpdateRef.current = viewUpdate
    const changes = viewUpdate.changedRanges || []
    if (isSqlInit.current || !changes.length) {
      isSqlInit.current = false
      return
    }

    isSqlInit.current = false
    sqlTextRef.current = sql
    setSqlText(sql)

    if (!enableSQLEditorAI) {
      return
    }

    let { fromA, toA, fromB, toB } = changes[0]

    const start = aiStartRef.current
    const isGeneTip = isGeneTipRef.current

    const { inserted = [] } = viewUpdate.changes
    let text = null
    const len = inserted.length
    if (len) {
      const insertText = (len === 1 ? inserted[0].text : inserted[1].text) || []
      text = insertText.length ? insertText[0] : null
    }

    if (text === '  ' && start !== -1 && !isGeneTip) {
      aiTabHandler(fromB, toB, viewUpdate)
    }

    const pos = viewUpdate.view.lineBlockAt(fromA)
    let texts = viewUpdate.state.doc?.text || []
    if (!texts.length) {
      let textArr: string[] = []
      const childrens = viewUpdate.state.doc.children || []
      childrens.forEach((item: { text: string[] }) => {
        if (item.text) {
          textArr.push(...item.text)
        }
      })
      texts = textArr.slice() || []
    }

    const index = +(pos.top / pos.height)
    const curLine = (texts[index] || '').trim()

    if (isGeneTip && start !== -1) {
      const arr = sql.split('\n')
      const prefixArrs = arr.slice(0, index + 1)
      const prefixLen = prefixArrs.length

      const beforeText = (sql.substring(0, fromA) + sql.substring(toB)).split('\n') || []
      if (beforeText[prefixLen - 1].includes(aiTips)) {
        const lineNum = getLineNumByPos(toB, texts)
        arr[lineNum] = ''

        sqlTextRef.current = arr.join('\n')
        setSqlText(arr.join('\n'))
        updateAiTipsPosInfo(-1, -1, false)
        setTimeout(() => {
          setCursor(toA, viewUpdate)
        }, 0)
      }
    }

    // trigger the ai
    const preText = sqlTextRef.current.split('\n')
    const nextText = (preText[index + 1] || '').trim()

    if (text === '' && curLine.indexOf('--') === 0 && curLine.substring(curLine.length - 2) !== '*/' && !nextText) {
      const aiText = curLine.substring(2)
      if (!aiText || !aiText.trim()) {
        return
      }

      if (!editorSettingRef.current?.is_privacy_allowed) {
        return
      }

      addAiTips2Text(index + 1, fromA + 1, viewUpdate)
      setAiLoadingIndex(index + 1)
      generateAISql(curLine.substring(2), index + 1, viewUpdate)
    }
  }, [])

  const userAggreementCancel = async () => {
    setIsAIInit(true)
    setIsAggVisible(false)

    await updateAIUserSetting(orgId, projectId, {
      chat2query_init: true
    })
  }

  const userAggreementModal = () => {
    setIsAggVisible(true)
  }

  const saveEditorSetting = async (values: { is_privacy_allowed: boolean }) => {
    eventTracking('User Aggreement Modal Confirm Button Clicked')

    const changeItems = {
      chat2query_init: true,
      is_privacy_allowed: values.is_privacy_allowed,
      privacy_box_count: 1
    }

    await updateAIUserSetting(orgId, projectId, changeItems)

    setIsAIInit(true)
    setEditorSetting(changeItems)
    setIsAggVisible(false)
  }

  const getLineNumByPos = (pos: number, texts: string[]) => {
    let len = 0
    let lineNum = 0

    for (let i = 0; i < texts.length; i++) {
      if (len + texts[i].length + 1 > pos) {
        lineNum = i
        break
      } else {
        len += texts[i].length + 1
      }
    }

    return lineNum
  }

  const addAiTips2Text = (lineNum: number, cursorPos: number, viewUpdate: any) => {
    const text = sqlTextRef.current.split('\n')
    text[lineNum] = aiTips
    sqlTextRef.current = text.join('\n')
    setSqlText(text.join('\n'))
    updateAiTipsPosInfo(lineNum + 1, 1, true)
  }

  const aiTabHandler = (fromB: number, toB: number, viewUpdate: any) => {
    const start = aiStartRef.current
    const len = aiTipLenRef.current

    const curSqlText = sqlTextRef.current.substring(0, fromB) + sqlTextRef.current.substring(toB)
    setSqlText(curSqlText)
    sqlTextRef.current = curSqlText

    const resLen = sqlTextRef.current
      .split('\n')
      .slice(start - 1, start + len - 1)
      .join('\n').length

    setTimeout(() => {
      setCursor(cursorPosRef.current - (toB - fromB) + resLen, viewUpdate)
    }, 0)
  }

  const setCursor = (pos: number, viewUpdate: any, scrollIntoView = false) => {
    let index = Math.min(pos, sqlTextRef.current.length)
    viewUpdate.view.focus()
    viewUpdate.view.dispatch({
      selection: {
        anchor: index,
        head: index
      },
      scrollIntoView
    })
  }

  const updateAiTipsPosInfo = (start = -1, len = -1, isGeneTip = false) => {
    setAiTipsPos({
      start,
      len,
      isGeneTip
    })
    aiTipStartRef.current = start
    aiTipLenRef.current = len
    isGeneTipRef.current = isGeneTip
    aiStartRef.current = start
  }

  useEffect(() => {
    const isGeneTip = isGeneTipRef.current
    if (!isGeneTip) {
      aiTipNumRef.current = 0
      aiTipsTimerRef.current && clearInterval(aiTipsTimerRef.current)
    } else {
      aiTipsTimerRef.current = window.setInterval(() => {
        let num = (aiTipNumRef.current + 1) % 7
        aiTipNumRef.current = num
        const texts = sqlTextRef.current.split('\n')
        let count = 0
        for (let i = 0; i < texts.length; i++) {
          if (texts[i].includes(aiTips)) {
            texts[i] = aiTips + '  ' + new Array(num).fill('.').join('')
            break
          } else {
            count += texts[i].length + 1
          }
        }
        sqlTextRef.current = texts.join('\n')
        setSqlText(texts.join('\n'))
      }, 200)
    }
  }, [aiTipsPos])

  useEffect(() => {
    if (!viewUpdateRef.current || isSqlInit.current) {
      return
    }
    let count = 0
    const texts = sqlText.split('\n')
    let isAiTips = false
    for (let i = 0; i < texts.length; i++) {
      if (!texts[i].includes(aiTips)) {
        count += texts[i].length + 1
      } else {
        isAiTips = true
        break
      }
    }
    if (isAiTips) {
      count = Math.min(count, sqlText.length)
      setCursor(count, viewUpdateRef.current, true)
    }
  }, [sqlText])

  const editorBlur = async () => {
    if (isSqlInit.current || !(sqlText !== editedSqlFile.content || databaseName != editedSqlFile.databse)) {
      return
    }

    const data = {
      ...fileRef.current,
      content: sqlTextRef.current
    }

    await updateSqlEditorFile(orgId, projectId, clusterId, data.id || 0, data)

    if (fileRef.current?.id === data.id) {
      setEditedSqlFile(data)
      fileRef.current = data as SqlFile
    }

    const list = sqlFilesRef.current
    list.forEach((file: SqlFile) => {
      if (file.id === data.id) {
        file.content = data.content
        file.database = data.database
      }
    })
    setSqlFiles(list)
  }

  const runSqlHandler = async (isRunAll = false, sessionId?: string) => {
    if (isRunning) {
      return
    }

    const text = (isRunAll ? sqlTextRef.current : sectionTextRef.current) || ' '
    if (!text.trim()) {
      return
    }

    setIsRunning(true)
    props.onRun && props.onRun()

    const noCommentText = removeComment(text).split('\n')

    let sqls = noCommentText
      .join(' ')
      .trimEnd()
      .split(';')
      .filter((i) => i)
      .reverse()
    if (!sqls.length) {
      sqls = [' ']
    }

    const len = sqls.length

    const list = sqls.map((_, i) => {
      if (i === len - 1) {
        return {
          status: RequestStatus.Loading,
          sql: _,
          res: {}
        }
      }

      return {
        status: RequestStatus.Waiting,
        sql: _,
        res: {}
      }
    })

    setSqlResultList(list)
    setEditSqlTexts(list)

    let count = 0
    while (count < len) {
      const index = len - count - 1
      eventTracking('SQL Editor Run Sql Start', {
        sql: list[index].sql,
        sessionId
      })
      const res = (await execSql(list[index].sql, sessionId)) as any
      eventTracking('SQL Editor Run Sql Success', {
        sql: list[index].sql,
        sessionId
      })
      const cur = list.slice()
      if (res && res.code === 200) {
        cur[index].res = res.data
        cur[index].status = RequestStatus.Success
        if (index !== 0) {
          cur[index - 1].status = RequestStatus.Loading
        }
        setSqlResultList(cur)
      } else {
        setIsRunning(false)
        cur[index].status = RequestStatus.Error
        cur[index].res = res
        cur.splice(0, len - count - 1)
        setSqlResultList(cur)
        break
      }

      count++
      if (count === len) {
        setIsRunning(false)
      }
    }
  }

  const removeComment = (text: string) => {
    if (!text) {
      return ''
    }

    const noBlock = strip(text, {
      line: false
    })

    const res = strip(noBlock, {
      language: 'sql',
      block: false
    })

    return res
  }

  const execSql = async (sqlLine: string, sessionId?: string) => {
    return new Promise(async (resolve, reject) => {
      try {
        const res = await sqlEditorSQLExecute(
          orgId,
          projectId,
          clusterId,
          {
            sql: sqlLine,
            sessionid: sessionId || fileRef.current?.sessionId
          },
          { timeout: 30 * 1000 }
        )
        resolve(res)
      } catch (e) {
        resolve(getErrorMessage(e))
      }
    })
  }

  const selectionHandler = (e: any) => {
    sectionTextRef.current = ''
    const { from, to } = e.state.selection.ranges[0]
    if (from === to) {
      const { changes } = e
      cursorPosingRef.current = from

      if (changes) {
        const { inserted = [] } = changes
        const len = inserted.length
        if (
          (len === 1 && inserted[0]?.text && inserted[0]?.text[0] === '  ') ||
          (len === 2 && inserted[1]?.text && inserted[1]?.text[0] === '  ')
        ) {
          cursorPosRef.current = from
        }
      }

      // const texts = e.state.doc.text || []
      const texts = getTexts(e.state.doc)
      let len = 0
      let lineNum = 0
      for (let i = 0; i < texts.length; i++) {
        if (len + texts[i].length + 1 > from) {
          lineNum = i
          break
        } else {
          len += texts[i].length + 1
        }
      }
      // check the ; around the selected line
      let pre = lineNum - 1
      let last = lineNum

      let preText = (texts[pre] && texts[pre].trim()) || ''
      let lastText = (texts[last] && texts[last].trim()) || ''

      while (pre > 0 && (!preText.length || preText[preText.length - 1] !== ';')) {
        pre--
        preText = (texts[pre] && texts[pre].trim()) || ''
      }

      while (last < texts.length && (!lastText.length || lastText[lastText.length - 1] !== ';')) {
        last++
        lastText = (texts[last] && texts[last].trim()) || ''
      }

      const str = texts.slice(0, last + 1).join(' \n')
      const noComments = removeComment(str)
        .split(';')
        .filter((i) => i)
      const execText = noComments[noComments.length - 1]
      sectionTextRef.current = execText
    } else {
      const text = sqlTextRef.current.substring(from, to)
      sectionTextRef.current = text
    }
  }

  const getTexts = (obj: any) => {
    let texts = obj.text || []
    if (obj.children && obj.children.length) {
      texts = []
      for (let i = 0; i < obj.children.length; i++) {
        texts.push(...(obj.children[i].text || []))
      }
    }
    return texts
  }

  const addNewFile = async () => {
    if (isCreatingFile) {
      return
    }

    eventTracking('SQL Editor Add New SQL Editor File Button Clicked', {
      position: 'Editor'
    })

    setSideMenuAcitveIndex(1)

    setIsCreatingFile(true)
    try {
      const fileParams = {
        name: `New query`,
        content: newFileContent
      }

      const createRes = await createSqlEditorFile(orgId, projectId, clusterId, fileParams)
      setIsCreatingFile(false)

      if (createRes.code !== 200) {
        return
      }

      getSqlFiles(false, {
        id: createRes.data,
        ...fileParams
      })
    } catch {
      setIsCreatingFile(false)
    }

    getSqlFiles(false)
  }

  const getDatabaseName = (lineNum: number) => {
    let name = ''

    if (!enableSQLEditorAIDB) {
      return name
    }

    return getUsedDatabaseName(lineNum)
  }

  const getUsedDatabaseName = (lineNum: number) => {
    let name = ''
    const texts = removeComment(
      sqlTextRef.current
        .split('\n')
        .slice(0, lineNum + 1)
        .join('\n')
    )
    const arrs = texts.split('\n')
    for (let i = 0; i < arrs.length; i++) {
      const cur = arrs[i] || ''
      const res = cur.match(/[uU][sS][eE]\s+(\S*)\s*;/) || []
      if (res.length > 1) {
        name = res[1]
      }
    }
    return name
  }

  const generateAISql = async (aiSql: string, cursorIndex: number, viewUpdate: any) => {
    if (aiLoadingIndex !== -1) {
      return
    }

    setCurAiSql(aiSql)

    const database = getDatabaseName(cursorIndex)

    eventTracking('SQL Editor Generate AI', {
      question: aiSql,
      database
    })

    try {
      const res = await generateSqlByBot(orgId, projectId, {
        question: aiSql,
        bot_type: '',
        database,
        cluster_id: clusterId
      })

      eventTracking('SQL Editor Generate AI Success', {
        question: aiSql,
        dataset: database
      })

      setAiLoadingIndex(-1)
      if (!res.response) {
        return
      }

      // cursor start from 0
      const from = cursorIndex + 1
      const texts = sqlTextRef.current.split('\n')
      const prefixArrs = texts.slice(0, cursorIndex + 1)

      const prefixLen = prefixArrs.length
      if (prefixArrs[prefixLen - 1].includes(aiTips)) {
        prefixArrs.pop()
      } else {
        return
      }

      const prefix = prefixArrs.join('\n')
      const affix = texts.slice(cursorIndex + 1)
      const preFormartRes = formatTextStatus(res.response)
      const response = preFormartRes

      const text =
        prefix + (response.indexOf('\n') === 0 ? '' : '\n') + response + (affix.length ? '\n' : '') + affix.join('\n')

      const len = response.split('\n').length
      setSqlText(text)
      sqlTextRef.current = text
      const aiTextLen = len
      updateAiTipsPosInfo(from, aiTextLen, false)

      const cursorLine = prefix.length
      // let the ai text into view
      setCursor(cursorLine + response.length, viewUpdate, true)
      // set the correct cursor
      setCursor(cursorLine + 1, viewUpdate)
    } catch (e: any) {
      // remove the ai tips
      const texts = sqlTextRef.current.split('\n')
      let index
      for (let i = 0; i < texts.length; i++) {
        if (texts[i].includes(aiTips)) {
          texts[i] = ''
          index = i
          break
        }
      }
      setSqlText(texts.join('\n'))
      sqlTextRef.current = texts.join('\n')

      setAiLoadingIndex(-1)
      updateAiTipsPosInfo(-1, -1, false)

      setCursor(texts.slice(0, index).join('\n').length + 1, viewUpdate)
    }
  }

  const formatTextStatus = (text: string) => {
    let index = 0
    while (index < text.length - 1) {
      if (text[index] === '\n') {
        index += 1
      } else {
        break
      }
    }
    return text.substring(index)
  }

  return (
    <div className={styles.sqlEditor} id="SqlEditor" ref={root}>
      <div className={styles.operationBtns}>
        <Button
          className={styles.runBtn}
          primary
          loading={isRunning}
          onClick={() => {
            eventTracking('SQL Editor Executed', {
              source: 'Run Button'
            })
            runSqlHandler(false, fileRef.current?.sessionId)
          }}
        >
          <RunFill />
        </Button>

        {!editorSetting.is_privacy_allowed && (
          <Button basic className={styles.aiBtn} onClick={() => setIsAggVisible(true)}>
            <Popup
              size="mini"
              content={'Enable AI power for data exploring'}
              position="top left"
              trigger={<AiExplore01 />}
            />
          </Button>
        )}

        <Dropdown
          icon={null}
          closeOnBlur
          direction="left"
          trigger={<DotsHorizontal onClick={() => eventTracking('Sql Editor Ellipse Button Clicked')} />}
        >
          <Dropdown.Menu>
            <Dropdown.Item disabled={isCreatingFile}>
              <div className="operation-menu-item" onClick={addNewFile}>
                <PlusSquare />
                <span>New SQL File</span>
              </div>
            </Dropdown.Item>

            <Dropdown.Item>
              <Settings />
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>

      <div className={styles.editorContainer}>
        <CodeMirror
          value={sqlText}
          autoFocus
          className={(() => {
            let res = ''
            const { start, len } = aiTipsPos

            if (start === -1) {
              return res
            }

            for (let i = start; i < start + len; i++) {
              res += `from${i} `
            }

            return res
          })()}
          placeholder={'USE database;\nSELECT column FROM table WHERE condition;'}
          basicSetup={{
            foldGutter: false,
            highlightActiveLine: true,
            autocompletion: false
            // completionKeymap: false
          }}
          extensions={extensions}
          theme={bbedit}
          onChange={changeHandler}
          onKeyDown={editorKeyDownHandler}
          onBlur={editorBlur}
          onUpdate={selectionHandler}
          // root={document.getElementById('SqlEditor')?.shadowRoot || document}
        />
      </div>

      <Modal
        open={isAggVisible}
        closeOnDocumentClick={false}
        closeOnDimmerClick={false}
        className={styles.userAggreementModal}
        onClose={userAggreementCancel}
      >
        <Modal.Header>
          <div className={styles.userAggreementHeader}>
            <div>Maximize Your Data Value with AI</div>
            <XClose onClick={userAggreementCancel} />
          </div>
        </Modal.Header>

        <Modal.Content>
          <div className={styles.userAggreementContent}>
            <div>
              Now TiDB Cloud is powered by AI, which will revolutionize the way to gain instant insight from your data.
              With AI empowered, you can get 10X productivity and make your imagination real.
            </div>

            <Form
              className={styles.settingsModal}
              submitContent="Save and  Get Started"
              defaultValues={{
                is_privacy_allowed: editorSettingRef.current?.is_privacy_allowed || false
              }}
              disabled={!isPrivacyAllow}
              onChange={(data: { is_privacy_allowed: boolean }) => setIsPrivacyAllow(data.is_privacy_allowed)}
              onSubmit={(values) => saveEditorSetting(values)}
            >
              <FormCheckbox
                name="is_privacy_allowed"
                label={
                  <label>
                    <div className={styles.aggreementContent}>
                      I allow PingCAP and OpenAI to use my code snippets to research and improve the services.
                    </div>
                  </label>
                }
              />
              <div className={styles.aggreementTips}>
                More information in{' '}
                <a href="https://www.pingcap.com/privacy-policy/privacy-chat2query/" target="_blank" rel="noreferrer">
                  Privacy FAQ
                </a>
                .
              </div>
            </Form>
          </div>
        </Modal.Content>
      </Modal>
    </div>
  )
}

type FormValues = {
  limit: number
  show_system_db_schema: boolean
}

export const Settings: React.FC<{ trigger?: React.ReactElement }> = ({ trigger }) => {
  const [visible, setVisible] = useState(false)
  const { sqlLimit, setSqlLimit, systemShow, setSystemShow, clusterId, orgId, projectId } = useContext(SqlEditorContext)
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)

  const closeModal = () => {
    setVisible(false)
  }

  useEffect(() => {
    setShow(show)
  }, [systemShow])

  useEffect(() => {
    if (visible) {
      fetchSetting()
    }
  }, [visible])

  const fetchSetting = async () => {
    setLoading(true)
    try {
      const res = await getSqlEditorRowsSetting(orgId, projectId, clusterId)
      setLoading(false)

      if (!res || res.code !== 200) {
        return
      }

      const data = res.data || {}
      setSqlLimit(data.limit || 500)
      const dbShow = data.show_system_db_schema || false
      setShow(dbShow)
      setSystemShow(dbShow)
    } catch (e) {
      setLoading(false)
    }
  }

  const saveSettings = async (values: any) => {
    const params = {
      limit: values.limit,
      show_system_db_schema: show
    }

    eventTracking('SQL Editor Settings Confirm Button Clicked', params)

    const res = await sqlEditorRowsSetting(orgId, projectId, clusterId, params)

    if (res.code !== 200) {
      return
    }

    setSqlLimit(values.limit)
    setSystemShow(show)

    closeModal()
  }

  const systemShowChanged = (visible: boolean) => {
    setShow(visible)
  }

  return (
    <Modal
      size="small"
      open={visible}
      trigger={
        trigger ? (
          React.cloneElement(trigger, {
            onClick: () => {
              eventTracking('SQL Editor Row Settings Button Clicked')
              setVisible(true)
            }
          })
        ) : (
          <div
            className="operation-menu-item"
            onClick={() => {
              eventTracking('SQL Editor Row Settings Button Clicked')
              setVisible(true)
            }}
          >
            <Settings01 />
            Settings
          </div>
        )
      }
      onClose={closeModal}
    >
      <Modal.Header>Chat2Query Settings</Modal.Header>
      <Modal.Content>
        <Form<FormValues>
          className={styles.settingsModal}
          defaultValues={{
            limit: sqlLimit
          }}
          onSubmit={saveSettings}
          submitContent="Save"
          onCancel={closeModal}
        >
          <FormSelect
            label="Result row limit"
            name="limit"
            options={[
              {
                text: 500,
                value: 500
              },
              {
                text: 1000,
                value: 1000
              },
              {
                text: 2000,
                value: 2000
              }
            ]}
          />
          <div className={styles.systemShow}>
            <span>Show system database schema</span>

            {loading ? (
              <Loader size="md" />
            ) : (
              <Switch
                onLabel="show"
                offLabel="hide"
                size="lg"
                checked={show}
                onChange={(e) => systemShowChanged(e.target.checked)}
              />
            )}
          </div>
        </Form>
      </Modal.Content>
    </Modal>
  )
}

export default observer(Editor)
